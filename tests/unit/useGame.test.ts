import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import type { TopicPair } from '~/types'

const testPairs: TopicPair[] = [
  { id: 'a', image: '/img/a.webp', text: 'Alpha', hint: 'First' },
  { id: 'b', image: '/img/b.webp', text: 'Beta', hint: 'Second' },
  { id: 'c', image: '/img/c.webp', text: 'Charlie', hint: 'Third' },
  { id: 'd', image: '/img/d.webp', text: 'Delta', hint: 'Fourth' },
]

describe('useGame', () => {
  it('creates two cards per pair (one image, one text)', () => {
    const game = useGame()
    game.init(testPairs)

    expect(game.cards.value).toHaveLength(8)

    const imageCards = game.cards.value.filter((c) => c.type === 'image')
    const textCards = game.cards.value.filter((c) => c.type === 'text')
    expect(imageCards).toHaveLength(4)
    expect(textCards).toHaveLength(4)
  })

  it('all cards start face-down and unmatched', () => {
    const game = useGame()
    game.init(testPairs)

    for (const card of game.cards.value) {
      expect(card.isFlipped).toBe(false)
      expect(card.isMatched).toBe(false)
    }
  })

  it('flipping a card sets isFlipped to true', () => {
    const game = useGame()
    game.init(testPairs)

    const card = game.cards.value[0]
    game.flipCard(card.id)

    const updated = game.cards.value.find((c) => c.id === card.id)!
    expect(updated.isFlipped).toBe(true)
  })

  it('matching two cards from the same pair marks them as matched', async () => {
    const game = useGame()
    game.init(testPairs)

    const imageCard = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const textCard = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'text')!

    game.flipCard(imageCard.id)
    game.flipCard(textCard.id)

    await nextTick()

    const updatedImage = game.cards.value.find((c) => c.id === imageCard.id)!
    const updatedText = game.cards.value.find((c) => c.id === textCard.id)!
    expect(updatedImage.isMatched).toBe(true)
    expect(updatedText.isMatched).toBe(true)
    expect(game.matchedPairs.value).toBe(1)
  })

  it('mismatched cards flip back after delay', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    const cardA = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const cardB = game.cards.value.find((c) => c.pairId === 'b' && c.type === 'text')!

    game.flipCard(cardA.id)
    game.flipCard(cardB.id)

    await nextTick()
    expect(game.cards.value.find((c) => c.id === cardA.id)!.isFlipped).toBe(true)

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(game.cards.value.find((c) => c.id === cardA.id)!.isFlipped).toBe(false)
    expect(game.cards.value.find((c) => c.id === cardB.id)!.isFlipped).toBe(false)

    vi.useRealTimers()
  })

  it('increments moves on each pair attempt', async () => {
    const game = useGame()
    game.init(testPairs)

    const card1 = game.cards.value[0]
    const card2 = game.cards.value[1]

    game.flipCard(card1.id)
    game.flipCard(card2.id)
    await nextTick()

    expect(game.moves.value).toBe(1)
  })

  it('increments streak on consecutive matches', async () => {
    const game = useGame()
    game.init(testPairs)

    const a1 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const a2 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'text')!
    game.flipCard(a1.id)
    game.flipCard(a2.id)
    await nextTick()
    expect(game.streak.value).toBe(1)

    const b1 = game.cards.value.find((c) => c.pairId === 'b' && c.type === 'image')!
    const b2 = game.cards.value.find((c) => c.pairId === 'b' && c.type === 'text')!
    game.flipCard(b1.id)
    game.flipCard(b2.id)
    await nextTick()
    expect(game.streak.value).toBe(2)
  })

  it('resets streak on mismatch', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    const a1 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const a2 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'text')!
    game.flipCard(a1.id)
    game.flipCard(a2.id)
    await nextTick()
    expect(game.streak.value).toBe(1)

    const c1 = game.cards.value.find((c) => c.pairId === 'b' && c.type === 'image')!
    const c2 = game.cards.value.find((c) => c.pairId === 'c' && c.type === 'text')!
    game.flipCard(c1.id)
    game.flipCard(c2.id)
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(game.streak.value).toBe(0)

    vi.useRealTimers()
  })

  it('ignores clicks on already matched cards', async () => {
    const game = useGame()
    game.init(testPairs)

    const a1 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const a2 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'text')!
    game.flipCard(a1.id)
    game.flipCard(a2.id)
    await nextTick()

    const movesBefore = game.moves.value
    game.flipCard(a1.id)
    expect(game.moves.value).toBe(movesBefore)
  })

  it('ignores clicks on the same card flipped twice', () => {
    const game = useGame()
    game.init(testPairs)

    const card = game.cards.value[0]
    game.flipCard(card.id)
    game.flipCard(card.id)

    const flipped = game.cards.value.filter((c) => c.isFlipped)
    expect(flipped).toHaveLength(1)
    expect(game.moves.value).toBe(0)
  })

  it('blocks flipping during mismatch reveal', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    const c1 = game.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const c2 = game.cards.value.find((c) => c.pairId === 'b' && c.type === 'text')!
    game.flipCard(c1.id)
    game.flipCard(c2.id)
    await nextTick()

    const c3 = game.cards.value.find((c) => c.pairId === 'c' && c.type === 'image')!
    game.flipCard(c3.id)
    expect(game.cards.value.find((c) => c.id === c3.id)!.isFlipped).toBe(false)

    vi.advanceTimersByTime(1000)
    vi.useRealTimers()
  })

  it('marks game as complete when all pairs matched', async () => {
    const game = useGame()
    game.init(testPairs)

    for (const pairId of ['a', 'b', 'c', 'd']) {
      const img = game.cards.value.find((c) => c.pairId === pairId && c.type === 'image')!
      const txt = game.cards.value.find((c) => c.pairId === pairId && c.type === 'text')!
      game.flipCard(img.id)
      game.flipCard(txt.id)
      await nextTick()
    }

    expect(game.isComplete.value).toBe(true)
    expect(game.matchedPairs.value).toBe(4)
  })

  it('cancels mismatch timeout when scope is disposed', async () => {
    vi.useFakeTimers()

    let game: ReturnType<typeof useGame>
    const scope = effectScope()
    scope.run(() => {
      game = useGame()
    })
    game!.init(testPairs)

    const c1 = game!.cards.value.find((c) => c.pairId === 'a' && c.type === 'image')!
    const c2 = game!.cards.value.find((c) => c.pairId === 'b' && c.type === 'text')!
    game!.flipCard(c1.id)
    game!.flipCard(c2.id)
    await nextTick()

    // Cards are still flipped (mismatch timeout pending)
    expect(game!.cards.value.find((c) => c.id === c1.id)!.isFlipped).toBe(true)

    // Dispose the scope — timeout should be cleared
    scope.stop()

    // Advancing time should NOT flip the cards back (timeout was cleared)
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(game!.cards.value.find((c) => c.id === c1.id)!.isFlipped).toBe(true)

    vi.useRealTimers()
  })

  it('tracks maxStreak across the game', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    for (const pairId of ['a', 'b']) {
      const img = game.cards.value.find((c) => c.pairId === pairId && c.type === 'image')!
      const txt = game.cards.value.find((c) => c.pairId === pairId && c.type === 'text')!
      game.flipCard(img.id)
      game.flipCard(txt.id)
      await nextTick()
    }
    expect(game.maxStreak.value).toBe(2)

    const c1 = game.cards.value.find((c) => c.pairId === 'c' && c.type === 'image')!
    const c2 = game.cards.value.find((c) => c.pairId === 'd' && c.type === 'text')!
    game.flipCard(c1.id)
    game.flipCard(c2.id)
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(game.streak.value).toBe(0)
    expect(game.maxStreak.value).toBe(2)

    vi.useRealTimers()
  })
})
