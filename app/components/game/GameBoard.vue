<script setup lang="ts">
import type { GameCard } from '~/types'
import { useGridNavigation } from '~/composables/useGridNavigation'

const props = defineProps<{
  cards: GameCard[]
  gridCols: number
  disabled: boolean
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()

const totalCards = computed(() => props.cards.length)
const gridColsRef = computed(() => props.gridCols)

const { focusedIndex, handleKeydown, resetFocus } = useGridNavigation(totalCards, gridColsRef)

const cardRefs = ref<HTMLElement[]>([])

watch(focusedIndex, (newIndex) => {
  nextTick(() => {
    cardRefs.value[newIndex]?.focus()
  })
})

watch(
  () => props.cards.length,
  () => resetFocus(),
)

function announce(message: string) {
  const el = document.getElementById('sr-announcements')
  if (el) el.textContent = message
}

function handleCardFlip(cardId: string) {
  emit('flip', cardId)
}

function handleCardKeydown(index: number, event: KeyboardEvent) {
  // Arrow key navigation — delegate to grid navigation
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    focusedIndex.value = index
    handleKeydown(event)
  }
}

defineExpose({ announce })
</script>

<template>
  <div
    class="grid gap-3"
    :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }"
    role="grid"
    aria-label="Game board"
  >
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      :class="{ invisible: card.isEliminated }"
      role="gridcell"
    >
      <GameCard
        :ref="
          (el) => {
            if (el) cardRefs[index] = (el as any).$el ?? el
          }
        "
        :card="card"
        :disabled="disabled"
        :tabindex="focusedIndex === index ? 0 : -1"
        :aria-label="
          card.isFlipped || card.isMatched
            ? `Card: ${card.content}${card.isMatched ? ', matched' : ''}`
            : `Card ${index + 1}, face down`
        "
        @flip="handleCardFlip(card.id)"
        @keydown="handleCardKeydown(index, $event)"
      />
    </div>
  </div>
</template>
