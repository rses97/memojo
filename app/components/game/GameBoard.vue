<script setup lang="ts">
import type { GameCard } from '~/types'

defineProps<{
  cards: GameCard[]
  gridCols: number
  disabled: boolean
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()
</script>

<template>
  <div
    class="grid gap-3"
    :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }"
    role="grid"
    aria-label="Game board"
  >
    <div
      v-for="card in cards"
      :key="card.id"
      :class="{ invisible: card.isEliminated }"
    >
      <GameCard
        :card="card"
        :disabled="disabled"
        @flip="emit('flip', card.id)"
      />
    </div>
  </div>
</template>
