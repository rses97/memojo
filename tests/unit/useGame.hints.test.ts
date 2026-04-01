import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGame } from '~/composables/useGame'
import type { TopicPair } from '~/types'

const testPairs: TopicPair[] = [
  { id: 'a', image: '/img/a.webp', text: 'Alpha' },
  { id: 'b', image: '/img/b.webp', text: 'Beta' },
  { id: 'c', image: '/img/c.webp', text: 'Charlie' },
  { id: 'd', image: '/img/d.webp', text: 'Delta' },
]

describe('useGame hints', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('peekAll', () => {
    it('exposes hints reactive state', () => {
      const game = useGame()
      game.init(testPairs)
      expect(game.hints.value).toEqual({
        peekAvailable: 1,
        eliminateAvailable: 1,
        peekUsed: 0,
        eliminateUsed: 0,
      })
    })

    it('flips all unmatched cards face-up then hides them after 1 second', () => {
      const game = useGame()
      game.init(testPairs)

      game.peekAll()

      const unmatchedCards = game.cards.value.filter((c) => !c.isMatched)
      expect(unmatchedCards.every((c) => c.isFlipped)).toBe(true)

      vi.advanceTimersByTime(1000)

      const cardsAfter = game.cards.value.filter((c) => !c.isMatched)
      expect(cardsAfter.every((c) => !c.isFlipped)).toBe(true)
    })

    it('decrements peekAvailable and increments peekUsed', () => {
      const game = useGame()
      game.init(testPairs)

      game.peekAll()
      vi.advanceTimersByTime(1000)

      expect(game.hints.value.peekAvailable).toBe(0)
      expect(game.hints.value.peekUsed).toBe(1)
    })

    it('does nothing when no peeks available', () => {
      const game = useGame()
      game.init(testPairs)

      game.peekAll()
      vi.advanceTimersByTime(1000)

      game.peekAll()

      const unmatchedCards = game.cards.value.filter((c) => !c.isMatched)
      expect(unmatchedCards.every((c) => !c.isFlipped)).toBe(true)
      expect(game.hints.value.peekUsed).toBe(1)
    })

    it('does not affect already matched cards', () => {
      const game = useGame()
      game.init(testPairs)

      // Match a pair first
      const imageCard = game.cards.value.find(
        (c) => c.pairId === 'a' && c.type === 'image',
      )!
      const textCard = game.cards.value.find(
        (c) => c.pairId === 'a' && c.type === 'text',
      )!
      game.flipCard(imageCard.id)
      game.flipCard(textCard.id)
      vi.advanceTimersByTime(1000)

      game.peekAll()

      const matchedCards = game.cards.value.filter((c) => c.isMatched)
      expect(matchedCards.every((c) => c.isFlipped)).toBe(true)

      vi.advanceTimersByTime(1000)

      // Matched cards should stay flipped
      const matchedAfter = game.cards.value.filter((c) => c.isMatched)
      expect(matchedAfter.every((c) => c.isFlipped)).toBe(true)
    })

    it('blocks card interaction during peek', () => {
      const game = useGame()
      game.init(testPairs)

      game.peekAll()
      expect(game.isPeeking.value).toBe(true)

      const card = game.cards.value[0]
      game.flipCard(card.id)

      vi.advanceTimersByTime(1000)
      expect(game.isPeeking.value).toBe(false)
    })
  })

  describe('eliminatePair', () => {
    it('removes one unmatched pair (2 cards) from the grid', () => {
      const game = useGame()
      game.init(testPairs)

      const initialCount = game.cards.value.length
      game.eliminatePair()

      const visibleCards = game.cards.value.filter((c) => !c.isEliminated)
      expect(visibleCards.length).toBe(initialCount - 2)
    })

    it('decrements eliminateAvailable and increments eliminateUsed', () => {
      const game = useGame()
      game.init(testPairs)

      game.eliminatePair()

      expect(game.hints.value.eliminateAvailable).toBe(0)
      expect(game.hints.value.eliminateUsed).toBe(1)
    })

    it('reduces totalPairs count', () => {
      const game = useGame()
      game.init(testPairs)

      expect(game.totalPairs.value).toBe(4)
      game.eliminatePair()
      expect(game.totalPairs.value).toBe(3)
    })

    it('does nothing when no eliminates available', () => {
      const game = useGame()
      game.init(testPairs)

      game.eliminatePair()
      const countAfterFirst = game.cards.value.filter(
        (c) => !c.isEliminated,
      ).length

      game.eliminatePair()
      const countAfterSecond = game.cards.value.filter(
        (c) => !c.isEliminated,
      ).length

      expect(countAfterSecond).toBe(countAfterFirst)
      expect(game.hints.value.eliminateUsed).toBe(1)
    })

    it('does not eliminate already matched pairs', () => {
      const game = useGame()
      game.init(testPairs)

      // Match a pair first
      const imageCard = game.cards.value.find(
        (c) => c.pairId === 'a' && c.type === 'image',
      )!
      const textCard = game.cards.value.find(
        (c) => c.pairId === 'a' && c.type === 'text',
      )!
      game.flipCard(imageCard.id)
      game.flipCard(textCard.id)
      vi.advanceTimersByTime(1000)

      game.eliminatePair()

      // The matched pair should still be there
      const matchedCards = game.cards.value.filter((c) => c.pairId === 'a')
      expect(matchedCards.every((c) => c.isMatched)).toBe(true)
      expect(matchedCards.every((c) => !c.isEliminated)).toBe(true)
    })
  })

  describe('reset clears hint state', () => {
    it('restores hints to initial values on reset', () => {
      const game = useGame()
      game.init(testPairs)

      game.peekAll()
      vi.advanceTimersByTime(1000)
      game.eliminatePair()

      game.reset()
      game.init(testPairs)

      expect(game.hints.value).toEqual({
        peekAvailable: 1,
        eliminateAvailable: 1,
        peekUsed: 0,
        eliminateUsed: 0,
      })
    })
  })
})
