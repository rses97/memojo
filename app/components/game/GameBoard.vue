<script setup lang="ts">
import type { GameCard } from '~/types'

defineProps<{
  cards: readonly GameCard[]
  gridCols: number
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
    <GameCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      @flip="emit('flip', $event)"
    />
  </div>
</template>
