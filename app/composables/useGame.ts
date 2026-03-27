import type { TopicPair, GameCard } from '~/types'

export function useGame() {
  const cards = ref<GameCard[]>([])
  const matchedPairs = ref(0)
  const totalPairs = ref(0)
  const moves = ref(0)
  const streak = ref(0)
  const maxStreak = ref(0)
  const isProcessing = ref(false)

  const flippedCards: string[] = []

  const isComplete = computed(() => matchedPairs.value === totalPairs.value && totalPairs.value > 0)

  function init(pairs: TopicPair[]) {
    const gameCards: GameCard[] = []

    for (const pair of pairs) {
      gameCards.push({
        id: `${pair.id}-image`,
        pairId: pair.id,
        type: 'image',
        content: pair.image,
        isFlipped: false,
        isMatched: false,
      })
      gameCards.push({
        id: `${pair.id}-text`,
        pairId: pair.id,
        type: 'text',
        content: pair.text,
        isFlipped: false,
        isMatched: false,
      })
    }

    cards.value = shuffleCards(gameCards)
    totalPairs.value = pairs.length
    matchedPairs.value = 0
    moves.value = 0
    streak.value = 0
    maxStreak.value = 0
    isProcessing.value = false
    flippedCards.length = 0
  }

  function flipCard(cardId: string) {
    if (isProcessing.value) return

    const card = cards.value.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    card.isFlipped = true
    flippedCards.push(cardId)

    if (flippedCards.length === 2) {
      moves.value++
      checkMatch()
    }
  }

  function checkMatch() {
    const [firstId, secondId] = flippedCards
    const first = cards.value.find(c => c.id === firstId)!
    const second = cards.value.find(c => c.id === secondId)!

    if (first.pairId === second.pairId && first.type !== second.type) {
      first.isMatched = true
      second.isMatched = true
      matchedPairs.value++
      streak.value++
      if (streak.value > maxStreak.value) {
        maxStreak.value = streak.value
      }
      flippedCards.length = 0
    }
    else {
      isProcessing.value = true
      streak.value = 0

      setTimeout(() => {
        first.isFlipped = false
        second.isFlipped = false
        flippedCards.length = 0
        isProcessing.value = false
      }, 1000)
    }
  }

  function reset() {
    cards.value = []
    matchedPairs.value = 0
    totalPairs.value = 0
    moves.value = 0
    streak.value = 0
    maxStreak.value = 0
    isProcessing.value = false
    flippedCards.length = 0
  }

  return {
    cards: readonly(cards),
    matchedPairs: readonly(matchedPairs),
    totalPairs: readonly(totalPairs),
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

function shuffleCards(cards: GameCard[]): GameCard[] {
  const arr = [...cards]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}
