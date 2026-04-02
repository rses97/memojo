<script setup lang="ts">
import type { StoredGameResult, PairPerformance } from '~/types'

useHead({ title: 'Profile' })

const db = useIndexedDB()
const userStore = useUserStore()
const { theme } = storeToRefs(userStore)

const allResults = ref<StoredGameResult[]>([])
const pairPerformances = ref<PairPerformance[]>([])

// Overall stats
const totalGamesPlayed = computed(() => allResults.value.length)

const averageScore = computed(() => {
  if (allResults.value.length === 0) return 0
  const sum = allResults.value.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / allResults.value.length)
})

const bestScore = computed(() => {
  if (allResults.value.length === 0) return 0
  return Math.max(...allResults.value.map((r) => r.score))
})

const averageAccuracy = computed(() => {
  if (allResults.value.length === 0) return 0
  const sum = allResults.value.reduce((acc, r) => acc + r.accuracy, 0)
  return Math.round((sum / allResults.value.length) * 100)
})

const bestStreak = computed(() => {
  if (allResults.value.length === 0) return 0
  return Math.max(...allResults.value.map((r) => r.maxStreak))
})

// Per-topic breakdown
const topicStats = computed(() => {
  const map = new Map<
    string,
    {
      games: number
      totalScore: number
      bestScore: number
      totalAccuracy: number
    }
  >()

  for (const result of allResults.value) {
    const existing = map.get(result.topic) ?? {
      games: 0,
      totalScore: 0,
      bestScore: 0,
      totalAccuracy: 0,
    }

    existing.games++
    existing.totalScore += result.score
    existing.bestScore = Math.max(existing.bestScore, result.score)
    existing.totalAccuracy += result.accuracy

    map.set(result.topic, existing)
  }

  return Array.from(map.entries())
    .map(([topic, stats]) => ({
      topic,
      games: stats.games,
      avgScore: Math.round(stats.totalScore / stats.games),
      bestScore: stats.bestScore,
      avgAccuracy: Math.round((stats.totalAccuracy / stats.games) * 100),
    }))
    .sort((a, b) => b.games - a.games)
})

// Accuracy trend (last 20 games)
const accuracyTrend = computed(() => {
  return [...allResults.value]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20)
    .map((r) => ({
      date: r.date,
      accuracy: Math.round(r.accuracy * 100),
    }))
})

// Weakest pairs
const weakestPairs = computed(() => {
  return pairPerformances.value
    .filter((p) => p.attempts >= 3)
    .map((p) => ({
      ...p,
      accuracy: Math.round((p.correctMatches / p.attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10)
})

onMounted(async () => {
  await userStore.hydrate()
  allResults.value = await db.getAllGameResults()

  const topics = new Set(allResults.value.map((r) => r.topic))
  const allPerf: PairPerformance[] = []
  for (const topic of topics) {
    const topicPerf = await db.getPairPerformanceByTopic(topic)
    allPerf.push(...topicPerf)
  }
  pairPerformances.value = allPerf
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Profile &amp; Stats</h1>

    <!-- Overall Stats -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Overall</h2>

      <div
        v-if="totalGamesPlayed === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No games played yet. Start playing to track your progress!
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ totalGamesPlayed }}</p>
          <p class="text-sm text-gray-500">Games</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ averageScore }}</p>
          <p class="text-sm text-gray-500">Avg Score</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ bestScore }}</p>
          <p class="text-sm text-gray-500">Best Score</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ averageAccuracy }}%</p>
          <p class="text-sm text-gray-500">Avg Accuracy</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ bestStreak }}</p>
          <p class="text-sm text-gray-500">Best Streak</p>
        </div>
      </div>
    </section>

    <!-- Per-Topic Breakdown -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Topics</h2>

      <div
        v-if="topicStats.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No topic data yet.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Games</th>
              <th class="px-4 py-3">Avg Score</th>
              <th class="px-4 py-3">Best Score</th>
              <th class="px-4 py-3">Avg Accuracy</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="topic in topicStats"
              :key="topic.topic"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3 font-medium">{{ topic.topic }}</td>
              <td class="px-4 py-3">{{ topic.games }}</td>
              <td class="px-4 py-3">{{ topic.avgScore }}</td>
              <td class="px-4 py-3 font-semibold">{{ topic.bestScore }}</td>
              <td class="px-4 py-3">{{ topic.avgAccuracy }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Accuracy Trend -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Accuracy Trend (Last 20 Games)</h2>

      <div
        v-if="accuracyTrend.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        Play more games to see your trend.
      </div>

      <div v-else class="flex items-end gap-1" style="height: 120px">
        <div
          v-for="(point, index) in accuracyTrend"
          :key="index"
          class="flex flex-1 flex-col items-center justify-end"
        >
          <div
            class="w-full rounded-t bg-blue-500 transition-all dark:bg-blue-400"
            :style="{ height: `${point.accuracy}%` }"
            :title="`${formatDate(point.date)}: ${point.accuracy}%`"
          />
        </div>
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-400">
        <span v-if="accuracyTrend.length > 0">{{ formatDate(accuracyTrend[0].date) }}</span>
        <span v-if="accuracyTrend.length > 1">{{
          formatDate(accuracyTrend[accuracyTrend.length - 1].date)
        }}</span>
      </div>
    </section>

    <!-- Weakest Pairs -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Pairs to Practice</h2>

      <div
        v-if="weakestPairs.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        Not enough data yet. Keep playing!
      </div>

      <div v-else class="grid gap-2">
        <div
          v-for="pair in weakestPairs"
          :key="pair.pairId"
          class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
        >
          <div>
            <p class="font-medium">{{ pair.pairId }}</p>
            <p class="text-sm text-gray-500">{{ pair.topic }}</p>
          </div>
          <div class="text-right">
            <p
              class="font-semibold"
              :class="pair.accuracy < 50 ? 'text-red-500' : 'text-yellow-500'"
            >
              {{ pair.accuracy }}%
            </p>
            <p class="text-xs text-gray-500">{{ pair.attempts }} attempts</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Settings placeholder -->
    <section>
      <h2 class="mb-4 text-xl font-semibold">Settings</h2>

      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Theme</p>
            <p class="text-sm text-gray-500">Current: {{ theme }}</p>
          </div>
          <p class="text-sm text-gray-400">Toggle coming in next update</p>
        </div>
      </div>
    </section>
  </div>
</template>
