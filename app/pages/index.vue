<script setup lang="ts">
const modes = [
  {
    title: 'Daily Challenge',
    description:
      'A new puzzle every day. Same cards for everyone — compare your score!',
    icon: '📅',
    to: '/daily',
  },
  {
    title: 'Topic Practice',
    description:
      'Pick a topic and master it through three progressively harder levels.',
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
      <h1 class="mb-3 text-4xl font-bold text-surface-900 dark:text-surface-50">
        Memojo
      </h1>
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
  </div>
</template>
