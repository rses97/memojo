<script setup lang="ts">
import type { StoredGameResult } from '~/types'

definePageMeta({ title: 'Leaderboard' })

const db = useIndexedDB()

const allResults = ref<StoredGameResult[]>([])
const selectedTopic = ref<string>('all')
const selectedMode = ref<string>('all')

const topics = computed(() => {
  const set = new Set(allResults.value.map((r) => r.topic))
  return Array.from(set).sort()
})

const filteredResults = computed(() => {
  let results = allResults.value

  if (selectedTopic.value !== 'all') {
    results = results.filter((r) => r.topic === selectedTopic.value)
  }
  if (selectedMode.value !== 'all') {
    results = results.filter((r) => r.mode === selectedMode.value)
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 50)
})

const personalBests = computed(() => {
  const bests = new Map<string, StoredGameResult>()

  for (const result of allResults.value) {
    const key = `${result.topic}-${result.mode}-${result.level}`
    const existing = bests.get(key)
    if (!existing || result.score > existing.score) {
      bests.set(key, result)
    }
  }

  return Array.from(bests.values()).sort((a, b) => b.score - a.score)
})

const dailyHistory = computed(() => {
  return allResults.value
    .filter((r) => r.mode === 'daily-challenge')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
})

onMounted(async () => {
  allResults.value = await db.getAllGameResults()
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Leaderboard</h1>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4">
      <select
        v-model="selectedTopic"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="all">All Topics</option>
        <option v-for="topic in topics" :key="topic" :value="topic">
          {{ topic }}
        </option>
      </select>

      <select
        v-model="selectedMode"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="all">All Modes</option>
        <option value="quick-play">Quick Play</option>
        <option value="daily-challenge">Daily Challenge</option>
        <option value="topic-practice">Topic Practice</option>
      </select>
    </div>

    <!-- Personal Bests -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Personal Bests</h2>

      <div
        v-if="personalBests.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No games played yet. Start playing to see your scores!
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">Rank</th>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Mode</th>
              <th class="px-4 py-3">Level</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Moves</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in personalBests"
              :key="result.id"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3 font-bold">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ result.topic }}</td>
              <td class="px-4 py-3">{{ result.mode }}</td>
              <td class="px-4 py-3">{{ result.level + 1 }}</td>
              <td class="px-4 py-3 font-semibold">{{ result.score }}</td>
              <td class="px-4 py-3">{{ result.moves }}</td>
              <td class="px-4 py-3">{{ formatTime(result.timeElapsed) }}</td>
              <td class="px-4 py-3">{{ formatDate(result.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Recent High Scores -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Recent High Scores</h2>

      <div
        v-if="filteredResults.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No matching results.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Accuracy</th>
              <th class="px-4 py-3">Streak</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in filteredResults"
              :key="result.id"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ result.topic }}</td>
              <td class="px-4 py-3 font-semibold">{{ result.score }}</td>
              <td class="px-4 py-3">
                {{ Math.round(result.accuracy * 100) }}%
              </td>
              <td class="px-4 py-3">{{ result.maxStreak }}</td>
              <td class="px-4 py-3">{{ formatDate(result.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Daily Challenge History -->
    <section>
      <h2 class="mb-4 text-xl font-semibold">Daily Challenge History</h2>

      <div
        v-if="dailyHistory.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No daily challenges completed yet.
      </div>

      <div v-else class="grid gap-3">
        <div
          v-for="result in dailyHistory"
          :key="result.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div>
            <p class="font-medium">{{ formatDate(result.date) }}</p>
            <p class="text-sm text-gray-500">
              {{ result.moves }} moves &middot;
              {{ formatTime(result.timeElapsed) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold">{{ result.score }}</p>
            <p class="text-sm text-gray-500">
              {{ Math.round(result.accuracy * 100) }}% accuracy
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
