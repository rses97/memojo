<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
  to: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col gap-3 rounded-2xl bg-surface-50 p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-surface-800"
  >
    <span class="text-4xl" aria-hidden="true">{{ icon }}</span>
    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-50">
      {{ title }}
    </h2>
    <p class="text-sm text-surface-700 dark:text-surface-300">
      {{ description }}
    </p>
    <span
      class="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-500 transition-colors group-hover:text-primary-600"
    >
      Play
      <span aria-hidden="true">&rarr;</span>
    </span>
  </NuxtLink>
</template>
