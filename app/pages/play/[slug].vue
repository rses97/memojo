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

const { cards, moves, matchedPairs, totalPairs, streak, maxStreak, isComplete, init: initGame, flipCard, reset: resetGame } = useGame()
const { remaining, elapsed, init: initTimer, start: startTimer, pause: pauseTimer } = useTimer()

const finalScore = ref<number | null>(null)

function startGame() {
  finalScore.value = null
  initGame(selectedPairs)
  initTimer(level.timeLimit, {
    onExpire: () => endGame(),
  })
  startTimer()
}

function endGame() {
  pauseTimer()
  finalScore.value = calculateScore({
    moves: moves.value,
    totalPairs: totalPairs.value,
    timeElapsed: elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: maxStreak.value,
  })
}

watch(isComplete, (complete) => {
  if (complete) endGame()
})

useHead({
  title: `Play ${topicPack.value.name} — Memojo`,
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
      :moves="moves"
      :matched-pairs="matchedPairs"
      :total-pairs="totalPairs"
      :streak="streak"
      :time-remaining="remaining"
    />

    <GameBoard
      :cards="cards"
      :grid-cols="level.gridCols"
      @flip="flipCard"
    />

    <div
      v-if="finalScore !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h2 class="mb-2 text-3xl font-bold">
          {{ isComplete ? 'Well Done!' : 'Time\'s Up!' }}
        </h2>
        <p class="mb-6 text-surface-700">
          {{ isComplete ? 'You matched all pairs!' : 'Better luck next time.' }}
        </p>
        <div class="mb-6 space-y-2 text-lg">
          <div>Score: <span class="font-bold text-primary-600">{{ finalScore }}</span></div>
          <div>Moves: <span class="font-bold">{{ moves }}</span></div>
          <div>Best Streak: <span class="font-bold">{{ maxStreak }}x</span></div>
          <div>Time: <span class="font-bold">{{ elapsed }}s</span></div>
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
