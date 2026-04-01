<script setup lang="ts">
import type { HintState } from '~/types'

const props = defineProps<{
  hints: HintState
  isPeeking: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  peek: []
  eliminate: []
}>()

const canPeek = computed(
  () => props.hints.peekAvailable > 0 && !props.isPeeking && !props.disabled,
)
const canEliminate = computed(
  () =>
    props.hints.eliminateAvailable > 0 && !props.isPeeking && !props.disabled,
)
</script>

<template>
  <div class="flex gap-3">
    <button
      :disabled="!canPeek"
      class="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-surface-800 dark:hover:bg-surface-700"
      @click="emit('peek')"
    >
      <span class="text-base" aria-hidden="true">👁</span>
      <span>Peek</span>
      <span
        class="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
      >
        {{ hints.peekAvailable }}
      </span>
    </button>

    <button
      :disabled="!canEliminate"
      class="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-surface-800 dark:hover:bg-surface-700"
      @click="emit('eliminate')"
    >
      <span class="text-base" aria-hidden="true">✂</span>
      <span>Eliminate</span>
      <span
        class="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
      >
        {{ hints.eliminateAvailable }}
      </span>
    </button>
  </div>
</template>
