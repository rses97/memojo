<script setup lang="ts">
import { formatTime } from '~/utils/time'

defineProps<{
  moves: number
  matchedPairs: number
  totalPairs: number
  streak: number
  timeRemaining: number
}>()
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 rounded-xl bg-surface-100 px-6 py-3"
  >
    <div class="flex items-center gap-6">
      <div class="text-center">
        <div class="text-sm text-surface-700">Moves</div>
        <div class="text-2xl font-bold">{{ moves }}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-surface-700">Matched</div>
        <div class="text-2xl font-bold">
          {{ matchedPairs }}/{{ totalPairs }}
        </div>
      </div>
      <div v-if="streak > 1" class="text-center">
        <div class="text-sm text-surface-700">Streak</div>
        <div class="text-2xl font-bold text-primary-500">{{ streak }}x</div>
      </div>
    </div>
    <div class="text-center">
      <div class="text-sm text-surface-700">Time</div>
      <div
        class="text-2xl font-bold tabular-nums"
        :class="{ 'text-danger': timeRemaining <= 10 }"
      >
        {{ formatTime(timeRemaining) }}
      </div>
    </div>
  </div>
</template>
