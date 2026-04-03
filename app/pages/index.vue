<script setup lang="ts">
useSeoMeta({
  ogTitle: 'Memojo — Train Your Brain with Cross-Modal Matching',
  description:
    'A cross-modal memory game that pairs images with text. Daily challenges, topic practice, adaptive difficulty, and spaced repetition for genuine cognitive training.',
  ogDescription:
    'A cross-modal memory game that pairs images with text. Daily challenges, topic practice, adaptive difficulty, and spaced repetition for genuine cognitive training.',
  ogImage: '/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  title: 'Memojo — Train Your Brain',
})

const modes = [
  {
    title: 'Daily Challenge',
    description: 'A new puzzle every day. Same cards for everyone — compare your score!',
    icon: '📅',
    to: '/daily',
  },
  {
    title: 'Topic Practice',
    description: 'Pick a topic and master it through three progressively harder levels.',
    icon: '📚',
    to: '/topics',
  },
  {
    title: 'Quick Play',
    description: 'Jump right in with random cards. No pressure, just practice.',
    icon: '⚡',
    to: '/play/world-flags',
  },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="mb-12 text-center">
      <h1 class="mb-3 text-4xl font-bold text-surface-900 dark:text-surface-50">Memojo</h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Match images to text. Train your memory. Beat your best.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-3">
      <GameModeCard
        v-for="mode in modes"
        :key="mode.to"
        :title="mode.title"
        :description="mode.description"
        :icon="mode.icon"
        :to="mode.to"
      />
    </div>

    <div class="mt-6 flex justify-center gap-4">
      <NuxtLink
        to="/leaderboard"
        class="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
      >
        Leaderboard
      </NuxtLink>
      <NuxtLink
        to="/profile"
        class="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
      >
        Profile
      </NuxtLink>
    </div>
  </div>
</template>
