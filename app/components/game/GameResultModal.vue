<script setup lang="ts">
defineProps<{
  title: string
  emoji: string
  score: number
  stats: string
}>()
</script>

<template>
  <div class="game-result-modal fixed inset-0 z-50 flex items-center justify-center text-center">
    <div class="px-8">
      <div class="mb-4 text-5xl">{{ emoji }}</div>
      <h2 class="mb-3 text-3xl font-bold text-primary-400">{{ title }}</h2>
      <p class="mb-2 text-lg text-surface-200">
        Score: <span class="font-bold">{{ score }}</span>
      </p>
      <p class="mb-8 text-sm text-surface-400">{{ stats }}</p>
      <div class="flex justify-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-result-modal {
  background: linear-gradient(135deg, #1e1e3f, #2d1b69);
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
  .game-result-modal {
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
</style>
