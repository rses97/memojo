import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { useSpacedRepetition } from '../../app/composables/useSpacedRepetition'

describe('useSpacedRepetition', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-26T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes a new pair with default SM-2 values', async () => {
    const sr = useSpacedRepetition()
    const card = await sr.getOrCreateCard('p1', 'world-flags')

    expect(card.easeFactor).toBe(2.5)
    expect(card.interval).toBe(0)
    expect(card.repetitions).toBe(0)
    expect(card.pairId).toBe('p1')
    expect(card.topic).toBe('world-flags')
  })

  it('updates a card after correct match', async () => {
    const sr = useSpacedRepetition()
    await sr.getOrCreateCard('p1', 'world-flags')

    const updated = await sr.recordReview('p1', 'world-flags', 4)

    expect(updated.repetitions).toBe(1)
    expect(updated.interval).toBe(1)
    expect(updated.nextReview).toBe('2026-03-27T12:00:00.000Z')
  })

  it('updates a card after failed match', async () => {
    const sr = useSpacedRepetition()
    await sr.getOrCreateCard('p1', 'world-flags')
    // First do a successful review to advance
    await sr.recordReview('p1', 'world-flags', 4)

    const updated = await sr.recordReview('p1', 'world-flags', 2)

    expect(updated.repetitions).toBe(0)
    expect(updated.interval).toBe(1)
  })

  it('returns pairs due for review', async () => {
    const sr = useSpacedRepetition()

    // Create a card with nextReview in the past
    await sr.getOrCreateCard('p1', 'world-flags')
    await sr.recordReview('p1', 'world-flags', 4) // nextReview = tomorrow

    // Create another card that's also reviewed
    await sr.getOrCreateCard('p2', 'world-flags')
    await sr.recordReview('p2', 'world-flags', 5) // nextReview = tomorrow

    // Move time forward 2 days
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'))

    const due = await sr.getDueCards('world-flags')
    expect(due).toHaveLength(2)
  })

  it('returns empty array when no cards are due', async () => {
    const sr = useSpacedRepetition()
    await sr.getOrCreateCard('p1', 'world-flags')
    await sr.recordReview('p1', 'world-flags', 4) // due tomorrow

    const due = await sr.getDueCards('world-flags')
    expect(due).toHaveLength(0)
  })

  it('selects pairs for session mixing due and new pairs', async () => {
    const sr = useSpacedRepetition()

    // Simulate some due cards
    await sr.getOrCreateCard('p1', 'world-flags')
    await sr.recordReview('p1', 'world-flags', 2) // failed, due tomorrow

    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'))

    const allPairIds = ['p1', 'p2', 'p3', 'p4', 'p5']
    const selected = await sr.selectPairsForSession('world-flags', allPairIds, 4)

    expect(selected).toHaveLength(4)
    // p1 should be included because it's due
    expect(selected).toContain('p1')
  })
})
