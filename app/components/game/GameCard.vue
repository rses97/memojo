<script setup lang="ts">
import type { GameCard } from '~/types'

const props = defineProps<{
  card: GameCard
  tabindex?: number
  ariaLabel?: string
}>()

const emit = defineEmits<{
  flip: [cardId: string]
  keydown: [event: KeyboardEvent]
}>()

function handleClick() {
  emit('flip', props.card.id)
}

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (!props.card.isFlipped && !props.card.isMatched) {
    return 'Hidden card — click to reveal'
  }
  return props.card.type === 'text' ? `Card: ${props.card.content}` : 'Image card'
})
</script>

<template>
  <div
    class="game-card"
    :class="{
      'is-flipped': card.isFlipped || card.isMatched,
      'is-matched': card.isMatched,
    }"
    :aria-label="computedAriaLabel"
    role="button"
    :tabindex="tabindex ?? 0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown="$emit('keydown', $event)"
  >
    <div class="game-card__inner">
      <div data-testid="card-back" class="game-card__face game-card__face--back">
        <span class="text-2xl">?</span>
      </div>
      <div data-testid="card-front" class="game-card__face game-card__face--front">
        <img
          v-if="card.type === 'image'"
          :src="card.content"
          :alt="card.pairId"
          class="h-full w-full rounded-[--radius-card] object-contain"
          loading="lazy"
        />
        <span v-else class="text-center text-lg font-semibold">
          {{ card.content }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  perspective: 600px;
  cursor: pointer;
  aspect-ratio: 3 / 4;
}

.game-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s var(--ease-flip);
  transform-style: preserve-3d;
}

.is-flipped .game-card__inner {
  transform: rotateY(180deg);
}

.is-matched .game-card__inner {
  animation: matchBounce 0.4s var(--ease-bounce);
}

.game-card__face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  border-radius: var(--radius-card);
  padding: 0.5rem;
}

.game-card__face--back {
  background-color: var(--color-primary-500);
  color: white;
}

.game-card__face--front {
  background-color: var(--color-surface-100);
  border: 2px solid var(--color-surface-200);
  transform: rotateY(180deg);
}

.is-matched .game-card__face--front {
  border-color: var(--color-success);
  box-shadow: 0 0 12px oklch(0.65 0.18 145 / 0.3);
}

@keyframes matchBounce {
  0%,
  100% {
    transform: rotateY(180deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-card__inner {
    transition: none;
  }
  .is-matched .game-card__inner {
    animation: none;
  }
}
</style>
