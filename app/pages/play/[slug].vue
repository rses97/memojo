<script setup lang="ts">
import type { TopicPack } from '~/types'
import { LEVELS } from '~/types'
import { calculateScore } from '~/utils/scoring'

const route = useRoute()
const slug = route.params.slug as string

const { data: topicPack, error } = await useFetch<TopicPack>(`/topics/${slug}.json`)

if (error.value || !topicPack.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Topic "${slug}" not found`,
  })
}

const level = LEVELS[0]!
const selectedPairs = topicPack.value.pairs.slice(0, level.pairs)

const game = useGame()
const timer = useTimer()

const finalScore = ref<number | null>(null)

function startGame() {
  finalScore.value = null
  game.init(selectedPairs)
  timer.init(level.timeLimit, {
    onExpire: () => endGame(),
  })
  timer.start()
}

function endGame() {
  timer.pause()
  finalScore.value = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
  })
}

function handleFlip(cardId: string) {
  game.flipCard(cardId)
}

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) endGame()
  },
)

useHead({
  title: `Play ${topicPack.value.name} — MemoryGame`,
})

startGame()
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
      :moves="game.moves.value"
      :matched-pairs="game.matchedPairs.value"
      :total-pairs="game.totalPairs.value"
      :streak="game.streak.value"
      :time-remaining="timer.remaining.value"
    />

    <GameBoard
      :cards="game.cards.value"
      :grid-cols="level.gridCols"
      @flip="handleFlip"
    />

    <!-- Game Complete Overlay -->
    <div
      v-if="finalScore !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h2 class="mb-2 text-3xl font-bold">
          {{ game.isComplete ? 'Well Done!' : 'Time\'s Up!' }}
        </h2>
        <p class="mb-6 text-surface-700">
          {{ game.isComplete ? 'You matched all pairs!' : 'Better luck next time.' }}
        </p>
        <div class="mb-6 space-y-2 text-lg">
          <div>Score: <span class="font-bold text-primary-600">{{ finalScore }}</span></div>
          <div>Moves: <span class="font-bold">{{ game.moves.value }}</span></div>
          <div>Best Streak: <span class="font-bold">{{ game.maxStreak.value }}x</span></div>
          <div>Time: <span class="font-bold">{{ timer.elapsed.value }}s</span></div>
        </div>
        <div class="flex gap-3 justify-center">
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
