<script setup lang="ts">
defineProps<{
  levelIndex: number
  totalLevels: number
  score: number
  isLastLevel: boolean
}>()

const emit = defineEmits<{
  next: []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-6 rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
  >
    <div class="text-4xl font-bold text-primary-500">
      Level {{ levelIndex + 1 }} Complete!
    </div>

    <div class="text-lg text-surface-700 dark:text-surface-200">
      Score:
      <span class="font-bold text-primary-600 dark:text-primary-400">{{
        score
      }}</span>
    </div>

    <div class="text-sm text-surface-500 dark:text-surface-400">
      {{ levelIndex + 1 }} / {{ totalLevels }} levels completed
    </div>

    <button
      type="button"
      class="rounded-xl bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
      @click="emit('next')"
    >
      {{ isLastLevel ? 'View Results' : 'Next Level' }}
    </button>
  </div>
</template>
