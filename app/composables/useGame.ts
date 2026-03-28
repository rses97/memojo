import type { TopicPair, GameCard } from '~/types'
import { shuffle } from '~/utils/shuffle'

export function useGame() {
  const cards = ref<GameCard[]>([])
  const matchedPairs = ref(0)
  const moves = ref(0)
  const streak = ref(0)
  const maxStreak = ref(0)
  const isProcessing = ref(false)

  const flippedCards = ref<GameCard[]>([])
  let mismatchTimeout: ReturnType<typeof setTimeout> | null = null

  const totalPairs = computed(() => cards.value.length / 2)
  const isComplete = computed(() => matchedPairs.value === totalPairs.value && totalPairs.value > 0)

  function resetState() {
    matchedPairs.value = 0
    moves.value = 0
    streak.value = 0
    maxStreak.value = 0
    isProcessing.value = false
    flippedCards.value = []
    if (mismatchTimeout !== null) {
      clearTimeout(mismatchTimeout)
      mismatchTimeout = null
    }
  }

  function init(pairs: TopicPair[]) {
    resetState()
    cards.value = shuffle(
      pairs.flatMap(pair => [
        { id: `${pair.id}-image`, pairId: pair.id, type: 'image' as const, content: pair.image, isFlipped: false, isMatched: false },
        { id: `${pair.id}-text`, pairId: pair.id, type: 'text' as const, content: pair.text, isFlipped: false, isMatched: false },
      ]),
    )
  }

  function flipCard(cardId: string) {
    if (isProcessing.value) return

    const card = cards.value.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    card.isFlipped = true
    flippedCards.value.push(card)

    if (flippedCards.value.length === 2) {
      moves.value++
      checkMatch()
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards.value as [GameCard, GameCard]

    if (first.pairId === second.pairId && first.type !== second.type) {
      first.isMatched = true
      second.isMatched = true
      matchedPairs.value++
      streak.value++
      maxStreak.value = Math.max(maxStreak.value, streak.value)
      flippedCards.value = []
    }
    else {
      isProcessing.value = true
      streak.value = 0

      mismatchTimeout = setTimeout(() => {
        first.isFlipped = false
        second.isFlipped = false
        flippedCards.value = []
        isProcessing.value = false
        mismatchTimeout = null
      }, 1000)
    }
  }

  function reset() {
    resetState()
    cards.value = []
  }

  return {
    cards: readonly(cards),
    matchedPairs: readonly(matchedPairs),
    totalPairs,
    moves: readonly(moves),
    streak: readonly(streak),
    maxStreak: readonly(maxStreak),
    isComplete,
    isProcessing: readonly(isProcessing),
    init,
    flipCard,
    reset,
  }
}
