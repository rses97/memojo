<script setup lang="ts">
import { dateSeed, seededShuffle } from '~/utils/seededRandom'
import { calculateScore } from '~/utils/scoring'
import { LEVELS } from '~/types'
import type { TopicPack } from '~/types'

useHead({ title: 'Daily Challenge' })

const game = useGame()
const timer = useTimer()
const { saveGameResult } = useGamePersistence()

const level = LEVELS[1] // Daily uses level 2 (6 pairs, 90s)
const isLoading = ref(true)
const isError = ref(false)
const isGameOver = ref(false)
const finalScore = ref(0)

const challengeDate = new Date()
const todaySeed = dateSeed(challengeDate)
const formattedDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
}).format(challengeDate)

async function loadAndStart() {
  try {
    const data = await $fetch<TopicPack>('/topics/world-flags.json')
    const shuffledPairs = seededShuffle(data.pairs, todaySeed)
    const selectedPairs = shuffledPairs.slice(0, level.pairs)
    game.init(selectedPairs, todaySeed)
    timer.init(level.timeLimit)
    timer.start()
    isLoading.value = false
  } catch {
    isError.value = true
    isLoading.value = false
  }
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
  async (complete) => {
    if (complete) {
      timer.pause()
      await endGame()
    }
  },
)

async function endGame() {
  if (isGameOver.value) return
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
  await saveGameResult({
    result: {
      score: finalScore.value,
      moves: game.moves.value,
      totalPairs: game.totalPairs.value,
      timeElapsed: timer.elapsed.value,
      timeLimit: level.timeLimit,
      maxStreak: game.maxStreak.value,
    },
    topic: 'world-flags',
    mode: 'daily-challenge',
    level: 1,
    hintsUsed: game.hints.value.peekUsed + game.hints.value.eliminateUsed,
    pairAttempts: new Map(),
  })
}

onMounted(() => {
  loadAndStart()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 text-center">
      <h1 class="mb-1 text-2xl font-bold text-surface-900 dark:text-surface-50">Daily Challenge</h1>
      <p class="text-sm text-surface-700 dark:text-surface-300">
        {{ formattedDate }}
      </p>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-surface-700 dark:text-surface-300">
      Loading today's challenge...
    </div>
    <div v-else-if="isError" class="py-20 text-center text-surface-700 dark:text-surface-300">
      <p class="mb-4">Failed to load today's challenge.</p>
      <NuxtLink to="/" class="text-primary-500 hover:text-primary-600">Back to Menu</NuxtLink>
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
        :disabled="game.isProcessing.value || game.isPeeking.value || isGameOver"
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
        <p class="text-sm text-surface-700 dark:text-surface-300">
          {{ game.matchedPairs.value }} / {{ game.totalPairs.value }} pairs matched in
          {{ game.moves.value }} moves
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
