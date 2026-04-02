<script setup lang="ts">
import type { TopicPack, AdaptiveLevelAdjustment } from '~/types'
import { LEVELS } from '~/types'
import { calculateScore } from '~/utils/scoring'

const route = useRoute()
const slug = route.params.slug as string
const { origin } = useRequestURL()

const { data: topicPack, error } = await useFetch<TopicPack>(`/topics/${slug}.json`, {
  baseURL: origin,
})

if (error.value || !topicPack.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Topic "${slug}" not found`,
  })
}

const currentLevel = ref<AdaptiveLevelAdjustment>(LEVELS[0]!)
const selectedPairs = ref(topicPack.value!.pairs.slice(0, LEVELS[0]!.pairs))

const {
  cards,
  moves,
  matchedPairs,
  totalPairs,
  streak,
  maxStreak,
  isComplete,
  isProcessing,
  hints,
  isPeeking,
  init: initGame,
  flipCard,
  peekAll,
  eliminatePair,
} = useGame()
const { remaining, elapsed, init: initTimer, start: startTimer, pause: pauseTimer } = useTimer()

const adaptive = useAdaptive()

const { saveGameResult } = useGamePersistence()
const pairAttempts = new Map<string, { attempts: number; timeMs: number; matched: boolean }>()
const gameStartMs = ref(0)
const prevMatchedPairIds = new Set<string>()

watch(moves, () => {
  const now = Date.now()
  const nowMatchedIds = new Set(cards.value.filter((c) => c.isMatched).map((c) => c.pairId))
  const flippedPairIds = new Set(
    cards.value.filter((c) => c.isFlipped && !c.isEliminated).map((c) => c.pairId),
  )
  for (const pairId of flippedPairIds) {
    const entry = pairAttempts.get(pairId)
    if (!entry) continue
    entry.attempts++
    if (nowMatchedIds.has(pairId) && !prevMatchedPairIds.has(pairId)) {
      entry.matched = true
      entry.timeMs = now - gameStartMs.value
      prevMatchedPairIds.add(pairId)
    }
  }
})

const finalScore = ref<number | null>(null)

async function startGame() {
  finalScore.value = null
  pairAttempts.clear()

  // Client-only adaptive adjustment
  if (import.meta.client) {
    const adjustment = await adaptive.getAdjustedLevel(slug, 0)
    currentLevel.value = adjustment
    const allIds = topicPack.value!.pairs.map((p) => p.id)
    const selectedIds = await adaptive.buildMixedSession(slug, allIds, adjustment.pairs)
    selectedPairs.value = topicPack.value!.pairs.filter((p) => selectedIds.includes(p.id))
    // Fallback: if no pairs selected (new topic), use first N
    if (selectedPairs.value.length === 0) {
      selectedPairs.value = topicPack.value!.pairs.slice(0, adjustment.pairs)
    }
  }

  initGame(selectedPairs.value)
  gameStartMs.value = Date.now()
  prevMatchedPairIds.clear()
  for (const pair of selectedPairs.value) {
    pairAttempts.set(pair.id, { attempts: 0, timeMs: 0, matched: false })
  }
  initTimer(currentLevel.value.timeLimit, {
    onExpire: () => endGame(),
  })
  startTimer()
}

async function endGame() {
  if (finalScore.value !== null) return
  pauseTimer()
  finalScore.value = calculateScore({
    moves: moves.value,
    totalPairs: totalPairs.value,
    timeElapsed: elapsed.value,
    timeLimit: currentLevel.value.timeLimit,
    maxStreak: maxStreak.value,
    hintsUsed: {
      peek: hints.value.peekUsed,
      eliminate: hints.value.eliminateUsed,
    },
  })
  await saveGameResult({
    result: {
      score: finalScore.value,
      moves: moves.value,
      totalPairs: totalPairs.value,
      timeElapsed: elapsed.value,
      timeLimit: currentLevel.value.timeLimit,
      maxStreak: maxStreak.value,
    },
    topic: slug,
    mode: 'quick-play',
    level: 0,
    hintsUsed: hints.value.peekUsed + hints.value.eliminateUsed,
    pairAttempts,
  })
}

watch(isComplete, async (complete) => {
  if (complete) await endGame()
})

useHead({
  title: `Play ${topicPack.value.name}`,
})

onMounted(() => {
  startGame()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ topicPack!.name }}</h1>
      <button
        class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
        @click="startGame"
      >
        Restart
      </button>
    </div>

    <GameHud
      :moves="moves"
      :matched-pairs="matchedPairs"
      :total-pairs="totalPairs"
      :streak="streak"
      :time-remaining="remaining"
    />

    <GameHints
      class="my-4 flex justify-center"
      :hints="hints"
      :is-peeking="isPeeking"
      :disabled="isProcessing || isPeeking || finalScore !== null"
      @peek="peekAll()"
      @eliminate="eliminatePair()"
    />

    <ClientOnly>
      <GameBoard
        :cards="cards"
        :grid-cols="currentLevel.gridCols"
        :disabled="isProcessing || isPeeking || finalScore !== null"
        @flip="flipCard"
      />
      <template #fallback>
        <div
          class="grid gap-3"
          :style="{
            gridTemplateColumns: `repeat(${currentLevel.gridCols}, minmax(0, 1fr))`,
          }"
        >
          <div
            v-for="n in currentLevel.pairs * 2"
            :key="n"
            class="aspect-[3/4] animate-pulse rounded-2xl bg-surface-200"
          />
        </div>
      </template>
    </ClientOnly>

    <div
      v-if="finalScore !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h2 class="mb-2 text-3xl font-bold">
          {{ isComplete ? 'Well Done!' : "Time's Up!" }}
        </h2>
        <p class="mb-6 text-surface-700">
          {{ isComplete ? 'You matched all pairs!' : 'Better luck next time.' }}
        </p>
        <div class="mb-6 space-y-2 text-lg">
          <div>
            Score:
            <span class="font-bold text-primary-600">{{ finalScore }}</span>
          </div>
          <div>
            Moves: <span class="font-bold">{{ moves }}</span>
          </div>
          <div>
            Best Streak: <span class="font-bold">{{ maxStreak }}x</span>
          </div>
          <div>
            Time: <span class="font-bold">{{ elapsed }}s</span>
          </div>
        </div>
        <div class="flex justify-center gap-3">
          <button
            class="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600"
            @click="startGame"
          >
            Play Again
          </button>
          <NuxtLink
            to="/"
            class="rounded-lg border border-surface-200 px-6 py-3 font-medium hover:bg-surface-100"
          >
            Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
