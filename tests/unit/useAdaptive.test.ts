import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useAdaptive } from '../../app/composables/useAdaptive'
import { useIndexedDB } from '../../app/composables/useIndexedDB'
import { LEVELS } from '../../app/types'
import type { SessionPerformance } from '../../app/types'

function makeSession(
  overrides: Partial<SessionPerformance> = {},
): SessionPerformance {
  return {
    id: crypto.randomUUID(),
    topic: 'world-flags',
    mode: 'quick-play',
    level: 0,
    accuracy: 0.8,
    averageMatchTimeMs: 2500,
    maxStreak: 3,
    date: new Date().toISOString(),
    ...overrides,
  }
}

describe('useAdaptive', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory()
  })

  it('returns base level when no history exists', async () => {
    const adaptive = useAdaptive()
    const adjustment = await adaptive.getAdjustedLevel('world-flags', 0)

    expect(adjustment.pairs).toBe(LEVELS[0].pairs)
    expect(adjustment.timeLimit).toBe(LEVELS[0].timeLimit)
  })

  it('increases difficulty after 3 consecutive high-accuracy sessions', async () => {
    const db = useIndexedDB()

    // Store 3 high-accuracy sessions for level 0
    for (let i = 0; i < 3; i++) {
      await db.putSessionPerformance(
        makeSession({ id: `s${i}`, accuracy: 0.9, level: 0 }),
      )
    }

    const adaptive = useAdaptive()
    const adjustment = await adaptive.getAdjustedLevel('world-flags', 0)

    // Should increase pairs or reduce time
    const base = LEVELS[0]
    const isHarder =
      adjustment.pairs > base.pairs || adjustment.timeLimit < base.timeLimit
    expect(isHarder).toBe(true)
  })

  it('decreases difficulty after low-accuracy sessions', async () => {
    const db = useIndexedDB()

    await db.putSessionPerformance(makeSession({ accuracy: 0.5, level: 0 }))

    const adaptive = useAdaptive()
    const adjustment = await adaptive.getAdjustedLevel('world-flags', 0)

    const base = LEVELS[0]
    // Should reduce pairs, increase time, or add preview
    const isEasier =
      adjustment.pairs < base.pairs ||
      adjustment.timeLimit > base.timeLimit ||
      (adjustment.previewTime !== undefined && adjustment.previewTime > 0)
    expect(isEasier).toBe(true)
  })

  it('does not go below minimum difficulty', async () => {
    const db = useIndexedDB()

    await db.putSessionPerformance(makeSession({ accuracy: 0.3, level: 0 }))

    const adaptive = useAdaptive()
    const adjustment = await adaptive.getAdjustedLevel('world-flags', 0)

    expect(adjustment.pairs).toBeGreaterThanOrEqual(2)
    expect(adjustment.timeLimit).toBeGreaterThan(0)
  })

  it('returns weak and strong pair IDs from performance data', async () => {
    const db = useIndexedDB()

    await db.putPairPerformance({
      pairId: 'p1',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 3,
      totalTimeMs: 15000,
      lastPlayed: new Date().toISOString(),
    })
    await db.putPairPerformance({
      pairId: 'p2',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 9,
      totalTimeMs: 8000,
      lastPlayed: new Date().toISOString(),
    })

    const adaptive = useAdaptive()
    const { weak, strong } = await adaptive.categorizePairs('world-flags')

    expect(weak).toContain('p1')
    expect(strong).toContain('p2')
  })

  it('builds mixed-difficulty session prioritizing weak pairs', async () => {
    const db = useIndexedDB()

    // p1 weak, p2 strong, p3/p4/p5 unknown
    await db.putPairPerformance({
      pairId: 'p1',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 2,
      totalTimeMs: 20000,
      lastPlayed: new Date().toISOString(),
    })
    await db.putPairPerformance({
      pairId: 'p2',
      topic: 'world-flags',
      attempts: 10,
      correctMatches: 10,
      totalTimeMs: 5000,
      lastPlayed: new Date().toISOString(),
    })

    const adaptive = useAdaptive()
    const allIds = ['p1', 'p2', 'p3', 'p4', 'p5']
    const selected = await adaptive.buildMixedSession('world-flags', allIds, 4)

    expect(selected).toHaveLength(4)
    // Weak pair p1 must be included
    expect(selected).toContain('p1')
  })
})
