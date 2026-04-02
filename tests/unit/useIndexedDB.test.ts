import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useIndexedDB } from '../../app/composables/useIndexedDB'
import type {
  StoredGameResult,
  UserPreferences,
  SpacedRepetitionCard,
  PairPerformance,
  SessionPerformance,
} from '../../app/types'

describe('useIndexedDB', () => {
  beforeEach(() => {
    // Reset fake-indexeddb between tests
    indexedDB = new IDBFactory()
  })

  it('puts and gets a game result', async () => {
    const db = useIndexedDB()
    const result: StoredGameResult = {
      id: 'r1',
      topic: 'world-flags',
      mode: 'quick-play',
      level: 0,
      score: 850,
      moves: 12,
      totalPairs: 4,
      timeElapsed: 45,
      timeLimit: 120,
      maxStreak: 3,
      hintsUsed: 0,
      accuracy: 0.67,
      date: '2026-03-26T10:00:00Z',
    }

    await db.putGameResult(result)
    const fetched = await db.getGameResult('r1')
    expect(fetched).toEqual(result)
  })

  it('gets all game results', async () => {
    const db = useIndexedDB()
    const base: StoredGameResult = {
      id: 'r1',
      topic: 'world-flags',
      mode: 'quick-play',
      level: 0,
      score: 850,
      moves: 12,
      totalPairs: 4,
      timeElapsed: 45,
      timeLimit: 120,
      maxStreak: 3,
      hintsUsed: 0,
      accuracy: 0.67,
      date: '2026-03-26T10:00:00Z',
    }

    await db.putGameResult(base)
    await db.putGameResult({ ...base, id: 'r2', score: 900 })

    const all = await db.getAllGameResults()
    expect(all).toHaveLength(2)
  })

  it('gets game results filtered by topic', async () => {
    const db = useIndexedDB()
    const base: StoredGameResult = {
      id: 'r1',
      topic: 'world-flags',
      mode: 'quick-play',
      level: 0,
      score: 850,
      moves: 12,
      totalPairs: 4,
      timeElapsed: 45,
      timeLimit: 120,
      maxStreak: 3,
      hintsUsed: 0,
      accuracy: 0.67,
      date: '2026-03-26T10:00:00Z',
    }

    await db.putGameResult(base)
    await db.putGameResult({ ...base, id: 'r2', topic: 'animals' })

    const flagResults = await db.getGameResultsByTopic('world-flags')
    expect(flagResults).toHaveLength(1)
    expect(flagResults[0].topic).toBe('world-flags')
  })

  it('stores and retrieves user preferences', async () => {
    const db = useIndexedDB()
    const prefs: UserPreferences = {
      theme: 'dark',
      preferredTopics: ['world-flags'],
    }

    await db.putUserPreferences(prefs)
    const fetched = await db.getUserPreferences()
    expect(fetched).toEqual(prefs)
  })

  it('stores and retrieves spaced repetition cards', async () => {
    const db = useIndexedDB()
    const card: SpacedRepetitionCard = {
      pairId: 'p1',
      topic: 'world-flags',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: '2026-03-27T00:00:00Z',
      lastReview: '2026-03-26T10:00:00Z',
    }

    await db.putSRCard(card)
    const fetched = await db.getSRCard('p1')
    expect(fetched).toEqual(card)
  })

  it('gets SR cards due for review', async () => {
    const db = useIndexedDB()
    const past: SpacedRepetitionCard = {
      pairId: 'p1',
      topic: 'world-flags',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: '2026-03-25T00:00:00Z',
      lastReview: '2026-03-24T10:00:00Z',
    }
    const future: SpacedRepetitionCard = {
      pairId: 'p2',
      topic: 'world-flags',
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReview: '2026-04-01T00:00:00Z',
      lastReview: '2026-03-26T10:00:00Z',
    }

    await db.putSRCard(past)
    await db.putSRCard(future)

    const due = await db.getSRCardsDueForReview('2026-03-26T12:00:00Z')
    expect(due).toHaveLength(1)
    expect(due[0].pairId).toBe('p1')
  })

  it('stores and retrieves pair performance', async () => {
    const db = useIndexedDB()
    const perf: PairPerformance = {
      pairId: 'p1',
      topic: 'world-flags',
      attempts: 3,
      correctMatches: 2,
      totalTimeMs: 4500,
      lastPlayed: '2026-03-26T10:00:00Z',
    }

    await db.putPairPerformance(perf)
    const fetched = await db.getPairPerformance('p1')
    expect(fetched).toEqual(perf)
  })

  it('stores and retrieves session performance', async () => {
    const db = useIndexedDB()
    const session: SessionPerformance = {
      id: 's1',
      topic: 'world-flags',
      mode: 'quick-play',
      level: 0,
      accuracy: 0.85,
      averageMatchTimeMs: 2300,
      maxStreak: 4,
      date: '2026-03-26T10:00:00Z',
    }

    await db.putSessionPerformance(session)
    const all = await db.getSessionsByTopic('world-flags')
    expect(all).toHaveLength(1)
    expect(all[0].accuracy).toBe(0.85)
  })

  it('deletes a game result', async () => {
    const db = useIndexedDB()
    const result: StoredGameResult = {
      id: 'r1',
      topic: 'world-flags',
      mode: 'quick-play',
      level: 0,
      score: 850,
      moves: 12,
      totalPairs: 4,
      timeElapsed: 45,
      timeLimit: 120,
      maxStreak: 3,
      hintsUsed: 0,
      accuracy: 0.67,
      date: '2026-03-26T10:00:00Z',
    }

    await db.putGameResult(result)
    await db.deleteGameResult('r1')
    const fetched = await db.getGameResult('r1')
    expect(fetched).toBeUndefined()
  })
})
