import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { useIndexedDB } from '../../app/composables/useIndexedDB'
import { useSpacedRepetition } from '../../app/composables/useSpacedRepetition'
import { useAdaptive } from '../../app/composables/useAdaptive'
import { calculateSM2 } from '../../app/utils/sm2'
import type { StoredGameResult, SessionPerformance } from '../../app/types'

describe('persistence integration', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-26T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('full game lifecycle: play, persist, adapt, repeat', async () => {
    const db = useIndexedDB()
    const adaptive = useAdaptive()
    const sr = useSpacedRepetition()

    // 1. Simulate 3 high-accuracy games
    for (let i = 0; i < 3; i++) {
      const result: StoredGameResult = {
        id: `game-${i}`,
        topic: 'world-flags',
        mode: 'quick-play',
        level: 0,
        score: 900 + i * 10,
        moves: 8,
        totalPairs: 4,
        timeElapsed: 30,
        timeLimit: 120,
        maxStreak: 4,
        hintsUsed: 0,
        accuracy: 0.9,
        date: new Date().toISOString(),
      }
      await db.putGameResult(result)

      const session: SessionPerformance = {
        id: `session-${i}`,
        topic: 'world-flags',
        mode: 'quick-play',
        level: 0,
        accuracy: 0.9,
        averageMatchTimeMs: 2000,
        maxStreak: 4,
        date: new Date().toISOString(),
      }
      await db.putSessionPerformance(session)
    }

    // 2. Check adaptive increases difficulty
    const adjusted = await adaptive.getAdjustedLevel('world-flags', 0)
    expect(adjusted.pairs).toBeGreaterThan(4) // base level 0 has 4 pairs

    // 3. Check leaderboard data is available
    const allResults = await db.getAllGameResults()
    expect(allResults).toHaveLength(3)

    // 4. Record SR reviews for pairs
    await sr.recordReview('flag-us', 'world-flags', 5) // perfect
    await sr.recordReview('flag-jp', 'world-flags', 1) // bad

    // 5. Check SR scheduling
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'))
    const dueCards = await sr.getDueCards('world-flags')
    // flag-jp should be due (interval=1), flag-us may not be
    const dueIds = dueCards.map((c) => c.pairId)
    expect(dueIds).toContain('flag-jp')

    // 6. Build mixed session favoring weak pairs
    const allPairIds = ['flag-us', 'flag-jp', 'flag-fr', 'flag-de', 'flag-br']
    await db.putPairPerformance({
      pairId: 'flag-jp',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 2,
      totalTimeMs: 15000,
      lastPlayed: new Date().toISOString(),
    })
    await db.putPairPerformance({
      pairId: 'flag-us',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 9,
      totalTimeMs: 5000,
      lastPlayed: new Date().toISOString(),
    })

    const selected = await adaptive.buildMixedSession('world-flags', allPairIds, 4)
    expect(selected).toContain('flag-jp') // weak pair prioritized
  })

  it('SM-2 progression over multiple reviews', () => {
    let state = { easeFactor: 2.5, interval: 0, repetitions: 0 }

    // First review: quality 4
    state = calculateSM2({ ...state, quality: 4 })
    expect(state.interval).toBe(1)
    expect(state.repetitions).toBe(1)

    // Second review: quality 4
    state = calculateSM2({ ...state, quality: 4 })
    expect(state.interval).toBe(6)
    expect(state.repetitions).toBe(2)

    // Third review: quality 5 (perfect)
    state = calculateSM2({ ...state, quality: 5 })
    expect(state.interval).toBeGreaterThan(6)
    expect(state.repetitions).toBe(3)

    // Fourth review: quality 1 (fail) — resets
    state = calculateSM2({ ...state, quality: 1 })
    expect(state.interval).toBe(1)
    expect(state.repetitions).toBe(0)
  })
})
