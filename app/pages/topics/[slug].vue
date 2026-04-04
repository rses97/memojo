<script setup lang="ts">
import { calculateScore } from '~/utils/scoring'
import type { TopicPack } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

const game = useGame()
const timer = useTimer()
const practice = useTopicPractice()
const adaptive = useAdaptive()

const { data: topic } = await useFetch<TopicPack>(`/topics/${slug}.json`)

if (!topic.value) {
  throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
}

useSeoMeta({
  title: `${topic.value.name} — Memojo`,
  ogTitle: `${topic.value.name} — Memojo`,
  description: `Practice matching ${topic.value.name.toLowerCase()} in this cross-modal memory game. ${topic.value.description}`,
  ogDescription: `Practice matching ${topic.value.name.toLowerCase()} in this cross-modal memory game. ${topic.value.description}`,
  ogImage: '/og-image.png',
  ogType: 'website',
})

useHead({
  title: `${topic.value.name} — Memojo`,
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${topic.value.name} — Memojo`,
        description: topic.value.description,
        url: `https://memojo.vercel.app/topics/${slug}`,
        mainEntity: {
          '@type': 'Game',
          name: topic.value.name,
          description: topic.value.description,
          numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
          gameItem: {
            '@type': 'Thing',
            name: `${topic.value.pairs.length} image-text pairs`,
          },
        },
      }),
    },
  ],
})

const isGameOver = ref(false)
const hasPreview = ref(false)
const isInitialized = ref(false)

let previewTimeout: ReturnType<typeof setTimeout> | null = null

onScopeDispose(() => {
  if (previewTimeout !== null) {
    clearTimeout(previewTimeout)
    previewTimeout = null
  }
})

onMounted(async () => {
  practice.start(topic.value!.pairs)
  await startCurrentLevel()
  isInitialized.value = true
})

async function startCurrentLevel() {
  if (practice.isAllComplete.value) return

  const level = practice.currentLevel.value
  if (!level) return

  // Use adaptive pair selection
  let pairs = practice.selectedPairs.value
  const allIds = topic.value!.pairs.map((p) => p.id)
  const selectedIds = await adaptive.buildMixedSession(slug, allIds, level.pairs)
  const adaptivePairs = topic.value!.pairs.filter((p) => selectedIds.includes(p.id))
  if (adaptivePairs.length > 0) {
    pairs = adaptivePairs
  }

  game.init(pairs)
  timer.init(level.timeLimit)
  isGameOver.value = false

  if (level.previewTime) {
    hasPreview.value = true
    game.setPreviewState(true)
    previewTimeout = setTimeout(() => {
      game.setPreviewState(false)
      hasPreview.value = false
      timer.start()
      previewTimeout = null
    }, level.previewTime * 1000)
  } else {
    hasPreview.value = false
    timer.start()
  }
}

function handleFlip(cardId: string) {
  if (isGameOver.value || hasPreview.value) return
  game.flipCard(cardId)
}

watch(
  () => timer.isExpired.value,
  (expired) => {
    if (expired) {
      handleLevelEnd()
    }
  },
)

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) {
      timer.pause()
      handleLevelEnd()
    }
  },
)

function handleLevelEnd() {
  if (isGameOver.value) return
  isGameOver.value = true
  const level = practice.currentLevel.value
  if (!level) return
  const score = calculateScore({
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
  practice.completeLevelAndShow(score)
}

async function handleNext() {
  practice.advanceLevel()
  if (!practice.isAllComplete.value) {
    await startCurrentLevel()
  }
}

async function handleRestart() {
  practice.start(topic.value!.pairs)
  await startCurrentLevel()
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/topics" class="text-sm text-primary-500 hover:text-primary-600">
        &larr; Back to topics
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50">
        {{ topic?.name }}
      </h1>
    </div>

    <div v-if="!isInitialized" class="py-20 text-center text-surface-500">Loading...</div>

    <template v-else-if="practice.isAllComplete.value">
      <div class="rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800">
        <h2 class="mb-4 text-3xl font-bold text-primary-500">All Levels Complete!</h2>
        <p class="mb-2 text-lg text-surface-700 dark:text-surface-200">
          Total Score:
          <span class="font-bold">{{ practice.totalScore.value }}</span>
        </p>
        <p class="mb-6 text-sm text-surface-500">
          You completed all {{ practice.totalLevels.value }} levels.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
            @click="handleRestart"
          >
            Play Again
          </button>
          <NuxtLink
            to="/topics"
            class="rounded-xl bg-surface-200 px-6 py-3 font-semibold text-surface-700 transition-colors hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600"
          >
            Other Topics
          </NuxtLink>
        </div>
      </div>
    </template>

    <template v-else-if="practice.showLevelComplete.value">
      <GameLevelComplete
        :level-index="practice.currentLevelIndex.value"
        :total-levels="practice.totalLevels.value"
        :score="practice.lastLevelScore.value"
        :is-last-level="practice.currentLevelIndex.value >= practice.totalLevels.value - 1"
        @next="handleNext"
      />
    </template>

    <template v-else>
      <div class="mb-4 text-center text-sm font-medium text-surface-500 dark:text-surface-400">
        Level {{ practice.currentLevelIndex.value + 1 }} /
        {{ practice.totalLevels.value }}
      </div>

      <div v-if="hasPreview" class="mb-4 text-center text-sm font-medium text-primary-500">
        Memorize the cards...
      </div>

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
        :disabled="isGameOver || hasPreview"
        @peek="game.peekAll()"
        @eliminate="game.eliminatePair()"
      />

      <GameBoard
        :cards="game.cards.value"
        :grid-cols="practice.currentLevel.value?.gridCols ?? 4"
        :disabled="game.isProcessing.value || game.isPeeking.value || isGameOver || hasPreview"
        @flip="handleFlip"
      />
    </template>
  </div>
</template>
