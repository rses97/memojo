<script setup lang="ts">
import { dateSeed, seededShuffle } from '~/utils/seededRandom'
import { calculateScore } from '~/utils/scoring'
import { LEVELS } from '~/types'
import type { TopicPack } from '~/types'

const game = useGame()
const timer = useTimer()

const level = LEVELS[1] // Daily uses level 2 (6 pairs, 90s)
const isLoading = ref(true)
const isGameOver = ref(false)
const finalScore = ref(0)

const todaySeed = dateSeed(new Date())
const formattedDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

async function loadAndStart() {
  const data = await $fetch<TopicPack>('/topics/world-flags.json')

  const shuffledPairs = seededShuffle(data.pairs, todaySeed)
  const selectedPairs = shuffledPairs.slice(0, level.pairs)

  game.init(selectedPairs, todaySeed)
  timer.init(level.timeLimit)
  timer.start()
  isLoading.value = false
}

function handleFlip(cardId: string) {
  if (isGameOver.value) return
  game.flipCard(cardId)
}

watch(
  () => timer.isExpired.value,
  (expired) => {
    if (expired) {
      endGame()
    }
  },
)

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) {
      timer.pause()
      endGame()
    }
  },
)

function endGame() {
  isGameOver.value = true
  finalScore.value = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
    hintsUsed: {
      peek: game.hints.value.peekUsed,
      eliminate: game.hints.value.eliminateUsed,
    },
  })
}

onMounted(() => {
  loadAndStart()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 text-center">
      <h1 class="mb-1 text-2xl font-bold text-surface-900 dark:text-surface-50">
        Daily Challenge
      </h1>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        {{ formattedDate }}
      </p>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-surface-500">
      Loading today's challenge...
    </div>

    <template v-else>
      <GameHud
        :moves="game.moves.value"
        :matched-pairs="game.matchedPairs.value"
        :total-pairs="game.totalPairs.value"
        :time-remaining="timer.remaining.value"
        :streak="game.streak.value"
      />

      <GameHints
        class="my-4 flex justify-center"
        :hints="game.hints.value"
        :is-peeking="game.isPeeking.value"
        :disabled="isGameOver"
        @peek="game.peekAll()"
        @eliminate="game.eliminatePair()"
      />

      <GameBoard
        :cards="game.cards.value"
        :grid-cols="level.gridCols"
        :disabled="
          game.isProcessing.value || game.isPeeking.value || isGameOver
        "
        @flip="handleFlip"
      />

      <div
        v-if="isGameOver"
        class="mt-8 rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
      >
        <h2 class="mb-2 text-3xl font-bold text-primary-500">
          {{ game.isComplete.value ? 'Challenge Complete!' : "Time's Up!" }}
        </h2>
        <p class="mb-4 text-lg text-surface-700 dark:text-surface-200">
          Score: <span class="font-bold">{{ finalScore }}</span>
        </p>
        <p class="text-sm text-surface-500">
          {{ game.matchedPairs.value }} / {{ game.totalPairs.value }} pairs
          matched in {{ game.moves.value }} moves
        </p>
        <NuxtLink
          to="/"
          class="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to Menu
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
