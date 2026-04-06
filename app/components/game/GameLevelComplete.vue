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
    role="dialog"
    aria-modal="true"
    :aria-labelledby="`level-complete-title-${levelIndex}`"
    class="game-level-complete fixed inset-0 z-50 flex items-center justify-center text-center"
  >
    <div class="px-8">
      <div
        class="mb-4 inline-block rounded-full border border-blue-500/25 bg-blue-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300"
      >
        Level {{ levelIndex + 1 }} of {{ totalLevels }}
      </div>
      <h2 :id="`level-complete-title-${levelIndex}`" class="mb-3 text-3xl font-bold text-blue-200">
        Level {{ levelIndex + 1 }} Complete!
      </h2>
      <p class="mb-2 text-lg text-surface-200">
        Score: <span class="font-bold text-blue-300">{{ score }}</span>
      </p>
      <div class="mb-6 flex justify-center gap-2">
        <div
          v-for="i in totalLevels"
          :key="i"
          :class="['pip', { 'pip--done': i <= levelIndex + 1 }]"
          data-testid="progress-pip"
        />
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        @click="emit('next')"
      >
        {{ isLastLevel ? 'View Results' : 'Next Level →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-level-complete {
  background: linear-gradient(160deg, #1a2035, #1e2d4a);
  animation: fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-level-complete {
    animation: fadeIn 0.3s ease both;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.pip {
  width: 28px;
  height: 5px;
  border-radius: 3px;
  background: #1e3a5f;
}

.pip--done {
  background: #3b82f6;
}
</style>
