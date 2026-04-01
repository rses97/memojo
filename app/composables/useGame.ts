import type { TopicPair, GameCard, HintState } from '~/types'
import { INITIAL_HINTS } from '~/types'
import { shuffle } from '~/utils/shuffle'
import { onScopeDispose } from 'vue'

export function useGame() {
  const cards = ref<GameCard[]>([])
  const matchedPairs = ref(0)
  const moves = ref(0)
  const streak = ref(0)
  const maxStreak = ref(0)
  const isProcessing = ref(false)
  const hints = ref<HintState>({ ...INITIAL_HINTS })
  const isPeeking = ref(false)

  const flippedCards = ref<GameCard[]>([])
  let mismatchTimeout: ReturnType<typeof setTimeout> | null = null
  let peekTimeout: ReturnType<typeof setTimeout> | null = null

  onScopeDispose(() => {
    if (mismatchTimeout !== null) {
      clearTimeout(mismatchTimeout)
      mismatchTimeout = null
    }
    if (peekTimeout !== null) {
      clearTimeout(peekTimeout)
      peekTimeout = null
    }
  })

  const totalPairs = computed(() => {
    const eliminated = cards.value.filter((c) => c.isEliminated).length / 2
    return cards.value.length / 2 - eliminated
  })
  const isComplete = computed(
    () => matchedPairs.value === totalPairs.value && totalPairs.value > 0,
  )

  function resetState() {
    matchedPairs.value = 0
    moves.value = 0
    streak.value = 0
    maxStreak.value = 0
    isProcessing.value = false
    flippedCards.value = []
    hints.value = { ...INITIAL_HINTS }
    isPeeking.value = false
    if (mismatchTimeout !== null) {
      clearTimeout(mismatchTimeout)
      mismatchTimeout = null
    }
    if (peekTimeout !== null) {
      clearTimeout(peekTimeout)
      peekTimeout = null
    }
  }

  function init(pairs: TopicPair[]) {
    resetState()
    cards.value = shuffle(
      pairs.flatMap((pair) => [
        {
          id: `${pair.id}-image`,
          pairId: pair.id,
          type: 'image' as const,
          content: pair.image,
          isFlipped: false,
          isMatched: false,
          isEliminated: false,
        },
        {
          id: `${pair.id}-text`,
          pairId: pair.id,
          type: 'text' as const,
          content: pair.text,
          isFlipped: false,
          isMatched: false,
          isEliminated: false,
        },
      ]),
    )
  }

  function flipCard(cardId: string) {
    if (isProcessing.value) return
    if (isPeeking.value) return

    const card = cards.value.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched || card.isEliminated) return

    // Mutating card objects directly is intentional: readonly(cards) prevents ref reassignment
    // but not object property mutation. flipCard is the sole intended mutation path.
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
    } else {
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

  function peekAll() {
    if (hints.value.peekAvailable <= 0 || isPeeking.value || isProcessing.value)
      return

    isPeeking.value = true
    hints.value.peekAvailable--
    hints.value.peekUsed++

    // Remember which unmatched cards were already face-up before peek
    const alreadyFlipped = new Set(
      cards.value
        .filter((c) => !c.isMatched && !c.isEliminated && c.isFlipped)
        .map((c) => c.id),
    )

    cards.value.forEach((card) => {
      if (!card.isMatched && !card.isEliminated) {
        card.isFlipped = true
      }
    })

    peekTimeout = setTimeout(() => {
      cards.value.forEach((card) => {
        if (
          !card.isMatched &&
          !card.isEliminated &&
          !alreadyFlipped.has(card.id)
        ) {
          card.isFlipped = false
        }
      })
      isPeeking.value = false
      peekTimeout = null
    }, 1000)
  }

  function eliminatePair() {
    if (hints.value.eliminateAvailable <= 0 || isProcessing.value) return

    const unmatchedPairIds = [
      ...new Set(
        cards.value
          .filter((c) => !c.isMatched && !c.isEliminated)
          .map((c) => c.pairId),
      ),
    ]

    if (unmatchedPairIds.length === 0) return

    const randomIndex = Math.floor(Math.random() * unmatchedPairIds.length)
    const pairIdToRemove = unmatchedPairIds[randomIndex]

    cards.value.forEach((card) => {
      if (card.pairId === pairIdToRemove) {
        card.isEliminated = true
        card.isFlipped = false
      }
    })

    hints.value.eliminateAvailable--
    hints.value.eliminateUsed++
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
    hints: readonly(hints),
    isPeeking: readonly(isPeeking),
    init,
    flipCard,
    reset,
    peekAll,
    eliminatePair,
  }
}
