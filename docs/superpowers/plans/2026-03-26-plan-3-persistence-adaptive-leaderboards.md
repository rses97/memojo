# Persistence, Adaptive Difficulty & Leaderboards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add IndexedDB persistence for game results, performance tracking, spaced repetition, and adaptive difficulty, plus leaderboard and profile pages.

**Architecture:** A thin `useIndexedDB` composable wraps the `idb` library for typed CRUD against three object stores (gameResults, performanceData, userPreferences). A Pinia user store manages preferences and hydrates from IndexedDB. `useAdaptive` reads performance history to adjust level parameters. `useSpacedRepetition` implements simplified SM-2 to resurface weak pairs. Leaderboard and profile pages query IndexedDB for read-only display.

**Tech Stack:** Nuxt 4, TypeScript (strict), Pinia, idb (npm), Vitest + @vue/test-utils, Tailwind CSS v4

---

## File Structure

```
memojo/
├── app/
│   ├── composables/
│   │   ├── useIndexedDB.ts          # Generic IndexedDB CRUD wrapper
│   │   ├── useAdaptive.ts           # Adaptive difficulty engine
│   │   └── useSpacedRepetition.ts   # Simplified SM-2 algorithm
│   ├── stores/
│   │   └── user.ts                  # Pinia user preferences store
│   ├── types/index.ts               # Extended with persistence types
│   ├── pages/
│   │   ├── leaderboard.vue          # Personal bests leaderboard
│   │   └── profile.vue              # Stats & settings page
│   └── utils/
│       └── sm2.ts                   # Pure SM-2 calculation function
├── tests/
│   └── unit/
│       ├── useIndexedDB.test.ts
│       ├── sm2.test.ts
│       ├── useAdaptive.test.ts
│       └── useSpacedRepetition.test.ts
```

---

### Task 1: Add Persistence Types

**Files:**

- Modify: `app/types/index.ts`

- [ ] **Step 1: Add persistence-related types**

Append to `app/types/index.ts`:

```typescript
// --- Persistence types (Plan 3) ---

export type GameMode = 'quick-play' | 'daily-challenge' | 'topic-practice'

export interface StoredGameResult {
  id: string
  topic: string
  mode: GameMode
  level: number
  score: number
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
  hintsUsed: number
  accuracy: number
  date: string // ISO 8601
}

export interface PairPerformance {
  pairId: string
  topic: string
  attempts: number
  correctMatches: number
  totalTimeMs: number
  lastPlayed: string // ISO 8601
}

export interface SessionPerformance {
  id: string
  topic: string
  mode: GameMode
  level: number
  accuracy: number
  averageMatchTimeMs: number
  maxStreak: number
  date: string // ISO 8601
}

export interface SpacedRepetitionCard {
  pairId: string
  topic: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string // ISO 8601
  lastReview: string // ISO 8601
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  preferredTopics: string[]
}

export interface AdaptiveLevelAdjustment {
  pairs: number
  gridCols: number
  timeLimit: number
  previewTime?: number
}
```

- [ ] **Step 2: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add persistence and adaptive difficulty types"
```

---

### Task 2: IndexedDB Composable

**Files:**

- Create: `app/composables/useIndexedDB.ts`
- Create: `tests/unit/useIndexedDB.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/useIndexedDB.test.ts`:

```typescript
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
```

- [ ] **Step 2: Install idb and fake-indexeddb**

```bash
pnpm add idb
pnpm add -D fake-indexeddb
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useIndexedDB.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write minimal implementation**

Create `app/composables/useIndexedDB.ts`:

```typescript
import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type {
  StoredGameResult,
  UserPreferences,
  SpacedRepetitionCard,
  PairPerformance,
  SessionPerformance,
} from '~/types'

interface MemoryGameDB extends DBSchema {
  gameResults: {
    key: string
    value: StoredGameResult
    indexes: {
      'by-topic': string
      'by-mode': string
      'by-date': string
    }
  }
  userPreferences: {
    key: string
    value: UserPreferences
  }
  srCards: {
    key: string
    value: SpacedRepetitionCard
    indexes: {
      'by-topic': string
      'by-nextReview': string
    }
  }
  pairPerformance: {
    key: string
    value: PairPerformance
    indexes: {
      'by-topic': string
    }
  }
  sessionPerformance: {
    key: string
    value: SessionPerformance
    indexes: {
      'by-topic': string
      'by-date': string
    }
  }
}

const DB_NAME = 'memojo'
const DB_VERSION = 1

function getDB() {
  return openDB<MemoryGameDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Game results store
      if (!db.objectStoreNames.contains('gameResults')) {
        const resultsStore = db.createObjectStore('gameResults', {
          keyPath: 'id',
        })
        resultsStore.createIndex('by-topic', 'topic')
        resultsStore.createIndex('by-mode', 'mode')
        resultsStore.createIndex('by-date', 'date')
      }

      // User preferences store
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences')
      }

      // Spaced repetition cards store
      if (!db.objectStoreNames.contains('srCards')) {
        const srStore = db.createObjectStore('srCards', { keyPath: 'pairId' })
        srStore.createIndex('by-topic', 'topic')
        srStore.createIndex('by-nextReview', 'nextReview')
      }

      // Pair performance store
      if (!db.objectStoreNames.contains('pairPerformance')) {
        const pairStore = db.createObjectStore('pairPerformance', {
          keyPath: 'pairId',
        })
        pairStore.createIndex('by-topic', 'topic')
      }

      // Session performance store
      if (!db.objectStoreNames.contains('sessionPerformance')) {
        const sessionStore = db.createObjectStore('sessionPerformance', {
          keyPath: 'id',
        })
        sessionStore.createIndex('by-topic', 'topic')
        sessionStore.createIndex('by-date', 'date')
      }
    },
  })
}

export function useIndexedDB() {
  // --- Game Results ---
  async function putGameResult(result: StoredGameResult) {
    const db = await getDB()
    await db.put('gameResults', result)
  }

  async function getGameResult(id: string) {
    const db = await getDB()
    return db.get('gameResults', id)
  }

  async function getAllGameResults() {
    const db = await getDB()
    return db.getAll('gameResults')
  }

  async function getGameResultsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('gameResults', 'by-topic', topic)
  }

  async function deleteGameResult(id: string) {
    const db = await getDB()
    await db.delete('gameResults', id)
  }

  // --- User Preferences ---
  async function putUserPreferences(prefs: UserPreferences) {
    const db = await getDB()
    await db.put('userPreferences', prefs, 'default')
  }

  async function getUserPreferences() {
    const db = await getDB()
    return db.get('userPreferences', 'default')
  }

  // --- Spaced Repetition Cards ---
  async function putSRCard(card: SpacedRepetitionCard) {
    const db = await getDB()
    await db.put('srCards', card)
  }

  async function getSRCard(pairId: string) {
    const db = await getDB()
    return db.get('srCards', pairId)
  }

  async function getAllSRCards() {
    const db = await getDB()
    return db.getAll('srCards')
  }

  async function getSRCardsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('srCards', 'by-topic', topic)
  }

  async function getSRCardsDueForReview(asOfISO: string) {
    const db = await getDB()
    const range = IDBKeyRange.upperBound(asOfISO)
    return db.getAllFromIndex('srCards', 'by-nextReview', range)
  }

  // --- Pair Performance ---
  async function putPairPerformance(perf: PairPerformance) {
    const db = await getDB()
    await db.put('pairPerformance', perf)
  }

  async function getPairPerformance(pairId: string) {
    const db = await getDB()
    return db.get('pairPerformance', pairId)
  }

  async function getPairPerformanceByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('pairPerformance', 'by-topic', topic)
  }

  // --- Session Performance ---
  async function putSessionPerformance(session: SessionPerformance) {
    const db = await getDB()
    await db.put('sessionPerformance', session)
  }

  async function getSessionsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('sessionPerformance', 'by-topic', topic)
  }

  async function getAllSessions() {
    const db = await getDB()
    return db.getAll('sessionPerformance')
  }

  return {
    putGameResult,
    getGameResult,
    getAllGameResults,
    getGameResultsByTopic,
    deleteGameResult,
    putUserPreferences,
    getUserPreferences,
    putSRCard,
    getSRCard,
    getAllSRCards,
    getSRCardsByTopic,
    getSRCardsDueForReview,
    putPairPerformance,
    getPairPerformance,
    getPairPerformanceByTopic,
    putSessionPerformance,
    getSessionsByTopic,
    getAllSessions,
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/useIndexedDB.test.ts`
Expected: PASS — all 8 tests green

- [ ] **Step 6: Commit**

```bash
git add app/composables/useIndexedDB.ts tests/unit/useIndexedDB.test.ts
git commit -m "feat: add useIndexedDB composable with full CRUD for all stores"
```

---

### Task 3: SM-2 Algorithm Utility

**Files:**

- Create: `app/utils/sm2.ts`
- Create: `tests/unit/sm2.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/sm2.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateSM2, type SM2Input, type SM2Output } from '../../app/utils/sm2'

describe('calculateSM2', () => {
  const defaultInput: SM2Input = {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    quality: 4,
  }

  it('first correct review sets interval to 1', () => {
    const result = calculateSM2({ ...defaultInput, quality: 4 })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('second correct review sets interval to 6', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      quality: 4,
    })
    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
  })

  it('third correct review uses easeFactor multiplier', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      quality: 4,
    })
    expect(result.interval).toBe(15) // Math.round(6 * 2.5)
    expect(result.repetitions).toBe(3)
  })

  it('failed review resets repetitions and interval', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 15,
      repetitions: 3,
      quality: 2,
    })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('adjusts ease factor upward for quality 5', () => {
    const result = calculateSM2({ ...defaultInput, quality: 5 })
    // EF' = 2.5 + (0.1 - (5-5)*(0.08 + (5-5)*0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBeCloseTo(2.6, 2)
  })

  it('adjusts ease factor downward for quality 3', () => {
    const result = calculateSM2({ ...defaultInput, quality: 3 })
    // EF' = 2.5 + (0.1 - (5-3)*(0.08 + (5-3)*0.02)) = 2.5 + (0.1 - 2*0.12) = 2.5 - 0.14 = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 2)
  })

  it('clamps ease factor to minimum 1.3', () => {
    const result = calculateSM2({
      easeFactor: 1.3,
      interval: 1,
      repetitions: 0,
      quality: 0,
    })
    // EF would go below 1.3, so clamp
    expect(result.easeFactor).toBe(1.3)
  })

  it('quality 0 (total failure) resets and adjusts EF', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 10,
      repetitions: 5,
      quality: 0,
    })
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
    // EF' = 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 + (0.1 - 5*0.18) = 2.5 - 0.8 = 1.7
    expect(result.easeFactor).toBeCloseTo(1.7, 2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/sm2.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `app/utils/sm2.ts`:

```typescript
export interface SM2Input {
  easeFactor: number
  interval: number
  repetitions: number
  quality: number // 0-5
}

export interface SM2Output {
  easeFactor: number
  interval: number
  repetitions: number
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { easeFactor, interval, repetitions, quality } = input

  // Adjust ease factor
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const newEaseFactor = Math.max(1.3, easeFactor + efDelta)

  if (quality >= 3) {
    // Correct response
    let newInterval: number
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: repetitions + 1,
    }
  }

  // Failed response
  return {
    easeFactor: newEaseFactor,
    interval: 1,
    repetitions: 0,
  }
}

/**
 * Convert a game match result to an SM-2 quality rating (0-5).
 * - 5: matched on first attempt, fast
 * - 4: matched on first attempt, normal speed
 * - 3: matched on first attempt, slow
 * - 2: matched on second attempt
 * - 1: matched after 3+ attempts
 * - 0: not matched (timed out or gave up)
 */
export function rateMatchQuality(
  attemptsForPair: number,
  matchTimeMs: number,
  averageMatchTimeMs: number,
): number {
  if (attemptsForPair === 0) return 0
  if (attemptsForPair === 1) {
    if (matchTimeMs < averageMatchTimeMs * 0.7) return 5
    if (matchTimeMs < averageMatchTimeMs * 1.3) return 4
    return 3
  }
  if (attemptsForPair === 2) return 2
  return 1
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/sm2.test.ts`
Expected: PASS — all 8 tests green

- [ ] **Step 5: Commit**

```bash
git add app/utils/sm2.ts tests/unit/sm2.test.ts
git commit -m "feat: add SM-2 spaced repetition algorithm utility"
```

---

### Task 4: Spaced Repetition Composable

**Files:**

- Create: `app/composables/useSpacedRepetition.ts`
- Create: `tests/unit/useSpacedRepetition.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/useSpacedRepetition.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { useSpacedRepetition } from '../../app/composables/useSpacedRepetition'

describe('useSpacedRepetition', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory()
    vi.useFakeTimers()
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useSpacedRepetition.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `app/composables/useSpacedRepetition.ts`:

```typescript
import { useIndexedDB } from './useIndexedDB'
import { calculateSM2 } from '~/utils/sm2'
import type { SpacedRepetitionCard } from '~/types'

export function useSpacedRepetition() {
  const db = useIndexedDB()

  async function getOrCreateCard(pairId: string, topic: string): Promise<SpacedRepetitionCard> {
    const existing = await db.getSRCard(pairId)
    if (existing) return existing

    const now = new Date().toISOString()
    const card: SpacedRepetitionCard = {
      pairId,
      topic,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: now,
      lastReview: now,
    }
    await db.putSRCard(card)
    return card
  }

  async function recordReview(
    pairId: string,
    topic: string,
    quality: number,
  ): Promise<SpacedRepetitionCard> {
    const card = await getOrCreateCard(pairId, topic)

    const result = calculateSM2({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      quality,
    })

    const now = new Date()
    const nextReview = new Date(now)
    nextReview.setDate(nextReview.getDate() + result.interval)

    const updated: SpacedRepetitionCard = {
      ...card,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: nextReview.toISOString(),
      lastReview: now.toISOString(),
    }

    await db.putSRCard(updated)
    return updated
  }

  async function getDueCards(topic: string): Promise<SpacedRepetitionCard[]> {
    const now = new Date().toISOString()
    const allDue = await db.getSRCardsDueForReview(now)
    return allDue.filter((card) => card.topic === topic)
  }

  async function selectPairsForSession(
    topic: string,
    allPairIds: string[],
    count: number,
  ): Promise<string[]> {
    const dueCards = await getDueCards(topic)
    const dueIds = dueCards.map((c) => c.pairId)

    // Prioritize due pairs
    const selected: string[] = []

    for (const id of dueIds) {
      if (selected.length >= count) break
      if (allPairIds.includes(id)) {
        selected.push(id)
      }
    }

    // Fill remaining with non-due pairs
    for (const id of allPairIds) {
      if (selected.length >= count) break
      if (!selected.includes(id)) {
        selected.push(id)
      }
    }

    return selected
  }

  return {
    getOrCreateCard,
    recordReview,
    getDueCards,
    selectPairsForSession,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/useSpacedRepetition.test.ts`
Expected: PASS — all 5 tests green

- [ ] **Step 5: Commit**

```bash
git add app/composables/useSpacedRepetition.ts tests/unit/useSpacedRepetition.test.ts
git commit -m "feat: add useSpacedRepetition composable with SM-2 scheduling"
```

---

### Task 5: Adaptive Difficulty Composable

**Files:**

- Create: `app/composables/useAdaptive.ts`
- Create: `tests/unit/useAdaptive.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/useAdaptive.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useAdaptive } from '../../app/composables/useAdaptive'
import { useIndexedDB } from '../../app/composables/useIndexedDB'
import { LEVELS } from '../../app/types'
import type { SessionPerformance } from '../../app/types'

function makeSession(overrides: Partial<SessionPerformance> = {}): SessionPerformance {
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
      await db.putSessionPerformance(makeSession({ id: `s${i}`, accuracy: 0.9, level: 0 }))
    }

    const adaptive = useAdaptive()
    const adjustment = await adaptive.getAdjustedLevel('world-flags', 0)

    // Should increase pairs or reduce time
    const base = LEVELS[0]
    const isHarder = adjustment.pairs > base.pairs || adjustment.timeLimit < base.timeLimit
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useAdaptive.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `app/composables/useAdaptive.ts`:

```typescript
import { useIndexedDB } from './useIndexedDB'
import { LEVELS } from '~/types'
import type { AdaptiveLevelAdjustment } from '~/types'

const HIGH_ACCURACY_THRESHOLD = 0.85
const LOW_ACCURACY_THRESHOLD = 0.6
const CONSECUTIVE_SESSIONS_FOR_INCREASE = 3
const WEAK_PAIR_ACCURACY_THRESHOLD = 0.5
const STRONG_PAIR_ACCURACY_THRESHOLD = 0.8
const MIN_PAIRS = 2
const TIME_ADJUSTMENT_SECONDS = 15
const PREVIEW_TIME_SECONDS = 3

export function useAdaptive() {
  const db = useIndexedDB()

  async function getAdjustedLevel(
    topic: string,
    levelIndex: number,
  ): Promise<AdaptiveLevelAdjustment> {
    const base = LEVELS[levelIndex] ?? LEVELS[0]
    const sessions = await db.getSessionsByTopic(topic)
    const levelSessions = sessions
      .filter((s) => s.level === levelIndex)
      .sort((a, b) => b.date.localeCompare(a.date))

    if (levelSessions.length === 0) {
      return {
        pairs: base.pairs,
        gridCols: base.gridCols,
        timeLimit: base.timeLimit,
        previewTime: base.previewTime,
      }
    }

    // Check for consecutive high accuracy (increase difficulty)
    const recentSessions = levelSessions.slice(0, CONSECUTIVE_SESSIONS_FOR_INCREASE)
    const allHighAccuracy =
      recentSessions.length >= CONSECUTIVE_SESSIONS_FOR_INCREASE &&
      recentSessions.every((s) => s.accuracy > HIGH_ACCURACY_THRESHOLD)

    if (allHighAccuracy) {
      return {
        pairs: base.pairs + 2,
        gridCols: base.gridCols + 2,
        timeLimit: Math.max(30, base.timeLimit - TIME_ADJUSTMENT_SECONDS),
        previewTime: base.previewTime,
      }
    }

    // Check for low accuracy (decrease difficulty)
    const lastSession = levelSessions[0]
    if (lastSession.accuracy < LOW_ACCURACY_THRESHOLD) {
      return {
        pairs: Math.max(MIN_PAIRS, base.pairs - 2),
        gridCols: Math.max(2, base.gridCols - 2),
        timeLimit: base.timeLimit + TIME_ADJUSTMENT_SECONDS,
        previewTime: PREVIEW_TIME_SECONDS,
      }
    }

    // No adjustment needed
    return {
      pairs: base.pairs,
      gridCols: base.gridCols,
      timeLimit: base.timeLimit,
      previewTime: base.previewTime,
    }
  }

  async function categorizePairs(topic: string): Promise<{ weak: string[]; strong: string[] }> {
    const performances = await db.getPairPerformanceByTopic(topic)

    const weak: string[] = []
    const strong: string[] = []

    for (const perf of performances) {
      const accuracy = perf.attempts > 0 ? perf.correctMatches / perf.attempts : 0
      if (accuracy < WEAK_PAIR_ACCURACY_THRESHOLD) {
        weak.push(perf.pairId)
      } else if (accuracy >= STRONG_PAIR_ACCURACY_THRESHOLD) {
        strong.push(perf.pairId)
      }
    }

    return { weak, strong }
  }

  async function buildMixedSession(
    topic: string,
    allPairIds: string[],
    count: number,
  ): Promise<string[]> {
    const { weak, strong } = await categorizePairs(topic)

    const selected: string[] = []

    // 1. Add all weak pairs first (they need practice)
    for (const id of weak) {
      if (selected.length >= count) break
      if (allPairIds.includes(id)) {
        selected.push(id)
      }
    }

    // 2. Fill with unseen/neutral pairs (not strong)
    const neutral = allPairIds.filter((id) => !selected.includes(id) && !strong.includes(id))
    for (const id of neutral) {
      if (selected.length >= count) break
      selected.push(id)
    }

    // 3. Fill remaining with strong pairs if needed
    for (const id of strong) {
      if (selected.length >= count) break
      if (allPairIds.includes(id) && !selected.includes(id)) {
        selected.push(id)
      }
    }

    return selected
  }

  return {
    getAdjustedLevel,
    categorizePairs,
    buildMixedSession,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/useAdaptive.test.ts`
Expected: PASS — all 5 tests green

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAdaptive.ts tests/unit/useAdaptive.test.ts
git commit -m "feat: add useAdaptive composable for dynamic difficulty adjustment"
```

---

### Task 6: Pinia User Store

**Files:**

- Create: `app/stores/user.ts`

- [ ] **Step 1: Write the store**

Create `app/stores/user.ts`:

```typescript
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { UserPreferences } from '~/types'

export const useUserStore = defineStore('user', () => {
  const theme = ref<'light' | 'dark'>('light')
  const preferredTopics = ref<string[]>([])
  const isHydrated = ref(false)

  async function hydrate() {
    if (import.meta.server) return

    const { useIndexedDB } = await import('~/composables/useIndexedDB')
    const db = useIndexedDB()
    const stored = await db.getUserPreferences()

    if (stored) {
      theme.value = stored.theme
      preferredTopics.value = stored.preferredTopics
    }

    isHydrated.value = true
  }

  async function persist() {
    if (import.meta.server) return

    const { useIndexedDB } = await import('~/composables/useIndexedDB')
    const db = useIndexedDB()
    await db.putUserPreferences({
      theme: theme.value,
      preferredTopics: preferredTopics.value,
    })
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    persist()
  }

  function toggleTopic(topicSlug: string) {
    const index = preferredTopics.value.indexOf(topicSlug)
    if (index >= 0) {
      preferredTopics.value.splice(index, 1)
    } else {
      preferredTopics.value.push(topicSlug)
    }
    persist()
  }

  return {
    theme,
    preferredTopics,
    isHydrated,
    hydrate,
    setTheme,
    toggleTopic,
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add app/stores/user.ts
git commit -m "feat: add Pinia user store with IndexedDB persistence"
```

---

### Task 7: Game Result Persistence Integration

**Files:**

- Modify: `app/pages/play/[slug].vue`
- Modify: `app/pages/daily.vue`

This task wires up game result saving after each completed game. The exact page structure was established in Plans 1-2.

- [ ] **Step 1: Create a composable for saving results**

Create `app/composables/useGamePersistence.ts`:

```typescript
import { useIndexedDB } from './useIndexedDB'
import { useSpacedRepetition } from './useSpacedRepetition'
import type {
  GameResult,
  GameMode,
  StoredGameResult,
  SessionPerformance,
  PairPerformance,
} from '~/types'
import { rateMatchQuality } from '~/utils/sm2'

interface SaveGameOptions {
  result: GameResult
  topic: string
  mode: GameMode
  level: number
  hintsUsed: number
  pairAttempts: Map<string, { attempts: number; timeMs: number; matched: boolean }>
}

export function useGamePersistence() {
  const db = useIndexedDB()
  const sr = useSpacedRepetition()

  async function saveGameResult(options: SaveGameOptions) {
    const { result, topic, mode, level, hintsUsed, pairAttempts } = options
    const now = new Date().toISOString()
    const id = `${topic}-${mode}-${Date.now()}`

    const accuracy = result.totalPairs > 0 ? result.score / (result.totalPairs * 100) : 0

    // 1. Store game result
    const storedResult: StoredGameResult = {
      id,
      topic,
      mode,
      level,
      score: result.score,
      moves: result.moves,
      totalPairs: result.totalPairs,
      timeElapsed: result.timeElapsed,
      timeLimit: result.timeLimit,
      maxStreak: result.maxStreak,
      hintsUsed,
      accuracy: Math.min(1, accuracy),
      date: now,
    }
    await db.putGameResult(storedResult)

    // 2. Store session performance
    const totalTimeMs = Array.from(pairAttempts.values()).reduce((sum, p) => sum + p.timeMs, 0)
    const matchedPairs = Array.from(pairAttempts.values()).filter((p) => p.matched)
    const avgMatchTime = matchedPairs.length > 0 ? totalTimeMs / matchedPairs.length : 0

    const session: SessionPerformance = {
      id: `session-${id}`,
      topic,
      mode,
      level,
      accuracy: storedResult.accuracy,
      averageMatchTimeMs: avgMatchTime,
      maxStreak: result.maxStreak,
      date: now,
    }
    await db.putSessionPerformance(session)

    // 3. Update pair performance and spaced repetition
    for (const [pairId, data] of pairAttempts) {
      // Update pair performance
      const existing = await db.getPairPerformance(pairId)
      const updated: PairPerformance = {
        pairId,
        topic,
        attempts: (existing?.attempts ?? 0) + data.attempts,
        correctMatches: (existing?.correctMatches ?? 0) + (data.matched ? 1 : 0),
        totalTimeMs: (existing?.totalTimeMs ?? 0) + data.timeMs,
        lastPlayed: now,
      }
      await db.putPairPerformance(updated)

      // Update spaced repetition
      const quality = rateMatchQuality(data.matched ? data.attempts : 0, data.timeMs, avgMatchTime)
      await sr.recordReview(pairId, topic, quality)
    }

    return storedResult
  }

  return { saveGameResult }
}
```

- [ ] **Step 2: Wire into play/[slug].vue game completion**

Add the following to the game completion handler in `app/pages/play/[slug].vue`. Inside the existing `watch(isComplete, ...)` or equivalent completion callback, add after score calculation:

```typescript
// Add import at script setup top:
const { saveGameResult } = useGamePersistence()

// In the completion handler, after calculating score:
await saveGameResult({
  result: {
    score: finalScore,
    moves: moves.value,
    totalPairs: totalPairs.value,
    timeElapsed: elapsed.value,
    timeLimit: currentLevel.value.timeLimit,
    maxStreak: maxStreak.value,
  },
  topic: slug,
  mode: 'quick-play',
  level: currentLevelIndex.value,
  hintsUsed: hintsUsed.value,
  pairAttempts: pairAttemptTracker,
})
```

- [ ] **Step 3: Wire into daily.vue game completion**

Same pattern as above but with `mode: 'daily-challenge'` and `level: 0`.

- [ ] **Step 4: Commit**

```bash
git add app/composables/useGamePersistence.ts app/pages/play/\[slug\].vue app/pages/daily.vue
git commit -m "feat: persist game results, pair performance, and SR data after each game"
```

---

### Task 8: Leaderboard Page

**Files:**

- Create: `app/pages/leaderboard.vue`

- [ ] **Step 1: Write the leaderboard page**

Create `app/pages/leaderboard.vue`:

```vue
<script setup lang="ts">
import type { StoredGameResult } from '~/types'

definePageMeta({ title: 'Leaderboard' })

const db = useIndexedDB()

const allResults = ref<StoredGameResult[]>([])
const selectedTopic = ref<string>('all')
const selectedMode = ref<string>('all')

const topics = computed(() => {
  const set = new Set(allResults.value.map((r) => r.topic))
  return Array.from(set).sort()
})

const filteredResults = computed(() => {
  let results = allResults.value

  if (selectedTopic.value !== 'all') {
    results = results.filter((r) => r.topic === selectedTopic.value)
  }
  if (selectedMode.value !== 'all') {
    results = results.filter((r) => r.mode === selectedMode.value)
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 50)
})

const personalBests = computed(() => {
  const bests = new Map<string, StoredGameResult>()

  for (const result of allResults.value) {
    const key = `${result.topic}-${result.mode}-${result.level}`
    const existing = bests.get(key)
    if (!existing || result.score > existing.score) {
      bests.set(key, result)
    }
  }

  return Array.from(bests.values()).sort((a, b) => b.score - a.score)
})

const dailyHistory = computed(() => {
  return allResults.value
    .filter((r) => r.mode === 'daily-challenge')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
})

onMounted(async () => {
  allResults.value = await db.getAllGameResults()
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Leaderboard</h1>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4">
      <select
        v-model="selectedTopic"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="all">All Topics</option>
        <option v-for="topic in topics" :key="topic" :value="topic">
          {{ topic }}
        </option>
      </select>

      <select
        v-model="selectedMode"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="all">All Modes</option>
        <option value="quick-play">Quick Play</option>
        <option value="daily-challenge">Daily Challenge</option>
        <option value="topic-practice">Topic Practice</option>
      </select>
    </div>

    <!-- Personal Bests -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Personal Bests</h2>

      <div
        v-if="personalBests.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No games played yet. Start playing to see your scores!
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">Rank</th>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Mode</th>
              <th class="px-4 py-3">Level</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Moves</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in personalBests"
              :key="result.id"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3 font-bold">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ result.topic }}</td>
              <td class="px-4 py-3">{{ result.mode }}</td>
              <td class="px-4 py-3">{{ result.level + 1 }}</td>
              <td class="px-4 py-3 font-semibold">{{ result.score }}</td>
              <td class="px-4 py-3">{{ result.moves }}</td>
              <td class="px-4 py-3">{{ formatTime(result.timeElapsed) }}</td>
              <td class="px-4 py-3">{{ formatDate(result.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Recent High Scores -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Recent High Scores</h2>

      <div
        v-if="filteredResults.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No matching results.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Accuracy</th>
              <th class="px-4 py-3">Streak</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in filteredResults"
              :key="result.id"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ result.topic }}</td>
              <td class="px-4 py-3 font-semibold">{{ result.score }}</td>
              <td class="px-4 py-3">{{ Math.round(result.accuracy * 100) }}%</td>
              <td class="px-4 py-3">{{ result.maxStreak }}</td>
              <td class="px-4 py-3">{{ formatDate(result.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Daily Challenge History -->
    <section>
      <h2 class="mb-4 text-xl font-semibold">Daily Challenge History</h2>

      <div
        v-if="dailyHistory.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No daily challenges completed yet.
      </div>

      <div v-else class="grid gap-3">
        <div
          v-for="result in dailyHistory"
          :key="result.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div>
            <p class="font-medium">{{ formatDate(result.date) }}</p>
            <p class="text-sm text-gray-500">
              {{ result.moves }} moves &middot;
              {{ formatTime(result.timeElapsed) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold">{{ result.score }}</p>
            <p class="text-sm text-gray-500">{{ Math.round(result.accuracy * 100) }}% accuracy</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Add leaderboard link to landing page**

In `app/pages/index.vue`, add a navigation link in the mode selection area:

```vue
<NuxtLink
  to="/leaderboard"
  class="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
>
  Leaderboard
</NuxtLink>
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/leaderboard.vue app/pages/index.vue
git commit -m "feat: add personal leaderboard page with filters and daily history"
```

---

### Task 9: Profile / Stats Page

**Files:**

- Create: `app/pages/profile.vue`

- [ ] **Step 1: Write the profile page**

Create `app/pages/profile.vue`:

```vue
<script setup lang="ts">
import type { StoredGameResult, PairPerformance } from '~/types'

definePageMeta({ title: 'Profile' })

const db = useIndexedDB()
const userStore = useUserStore()
const { theme } = storeToRefs(userStore)

const allResults = ref<StoredGameResult[]>([])
const pairPerformances = ref<PairPerformance[]>([])

// Overall stats
const totalGamesPlayed = computed(() => allResults.value.length)

const averageScore = computed(() => {
  if (allResults.value.length === 0) return 0
  const sum = allResults.value.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / allResults.value.length)
})

const bestScore = computed(() => {
  if (allResults.value.length === 0) return 0
  return Math.max(...allResults.value.map((r) => r.score))
})

const averageAccuracy = computed(() => {
  if (allResults.value.length === 0) return 0
  const sum = allResults.value.reduce((acc, r) => acc + r.accuracy, 0)
  return Math.round((sum / allResults.value.length) * 100)
})

const bestStreak = computed(() => {
  if (allResults.value.length === 0) return 0
  return Math.max(...allResults.value.map((r) => r.maxStreak))
})

// Per-topic breakdown
const topicStats = computed(() => {
  const map = new Map<
    string,
    {
      games: number
      totalScore: number
      bestScore: number
      totalAccuracy: number
    }
  >()

  for (const result of allResults.value) {
    const existing = map.get(result.topic) ?? {
      games: 0,
      totalScore: 0,
      bestScore: 0,
      totalAccuracy: 0,
    }

    existing.games++
    existing.totalScore += result.score
    existing.bestScore = Math.max(existing.bestScore, result.score)
    existing.totalAccuracy += result.accuracy

    map.set(result.topic, existing)
  }

  return Array.from(map.entries())
    .map(([topic, stats]) => ({
      topic,
      games: stats.games,
      avgScore: Math.round(stats.totalScore / stats.games),
      bestScore: stats.bestScore,
      avgAccuracy: Math.round((stats.totalAccuracy / stats.games) * 100),
    }))
    .sort((a, b) => b.games - a.games)
})

// Accuracy trend (last 20 games)
const accuracyTrend = computed(() => {
  return allResults.value
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20)
    .map((r) => ({
      date: r.date,
      accuracy: Math.round(r.accuracy * 100),
    }))
})

// Weakest pairs
const weakestPairs = computed(() => {
  return pairPerformances.value
    .filter((p) => p.attempts >= 3)
    .map((p) => ({
      ...p,
      accuracy: Math.round((p.correctMatches / p.attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10)
})

onMounted(async () => {
  await userStore.hydrate()
  allResults.value = await db.getAllGameResults()

  const topics = new Set(allResults.value.map((r) => r.topic))
  const allPerf: PairPerformance[] = []
  for (const topic of topics) {
    const topicPerf = await db.getPairPerformanceByTopic(topic)
    allPerf.push(...topicPerf)
  }
  pairPerformances.value = allPerf
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Profile &amp; Stats</h1>

    <!-- Overall Stats -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Overall</h2>

      <div
        v-if="totalGamesPlayed === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No games played yet. Start playing to track your progress!
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ totalGamesPlayed }}</p>
          <p class="text-sm text-gray-500">Games</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ averageScore }}</p>
          <p class="text-sm text-gray-500">Avg Score</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ bestScore }}</p>
          <p class="text-sm text-gray-500">Best Score</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ averageAccuracy }}%</p>
          <p class="text-sm text-gray-500">Avg Accuracy</p>
        </div>
        <div class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold">{{ bestStreak }}</p>
          <p class="text-sm text-gray-500">Best Streak</p>
        </div>
      </div>
    </section>

    <!-- Per-Topic Breakdown -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Topics</h2>

      <div
        v-if="topicStats.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        No topic data yet.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
          >
            <tr>
              <th class="px-4 py-3">Topic</th>
              <th class="px-4 py-3">Games</th>
              <th class="px-4 py-3">Avg Score</th>
              <th class="px-4 py-3">Best Score</th>
              <th class="px-4 py-3">Avg Accuracy</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="topic in topicStats"
              :key="topic.topic"
              class="border-b border-gray-100 dark:border-gray-800"
            >
              <td class="px-4 py-3 font-medium">{{ topic.topic }}</td>
              <td class="px-4 py-3">{{ topic.games }}</td>
              <td class="px-4 py-3">{{ topic.avgScore }}</td>
              <td class="px-4 py-3 font-semibold">{{ topic.bestScore }}</td>
              <td class="px-4 py-3">{{ topic.avgAccuracy }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Accuracy Trend -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Accuracy Trend (Last 20 Games)</h2>

      <div
        v-if="accuracyTrend.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        Play more games to see your trend.
      </div>

      <div v-else class="flex items-end gap-1" style="height: 120px">
        <div
          v-for="(point, index) in accuracyTrend"
          :key="index"
          class="flex flex-1 flex-col items-center justify-end"
        >
          <div
            class="w-full rounded-t bg-blue-500 transition-all dark:bg-blue-400"
            :style="{ height: `${point.accuracy}%` }"
            :title="`${formatDate(point.date)}: ${point.accuracy}%`"
          />
        </div>
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-400">
        <span v-if="accuracyTrend.length > 0">{{ formatDate(accuracyTrend[0].date) }}</span>
        <span v-if="accuracyTrend.length > 1">{{
          formatDate(accuracyTrend[accuracyTrend.length - 1].date)
        }}</span>
      </div>
    </section>

    <!-- Weakest Pairs -->
    <section class="mb-10">
      <h2 class="mb-4 text-xl font-semibold">Pairs to Practice</h2>

      <div
        v-if="weakestPairs.length === 0"
        class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
      >
        Not enough data yet. Keep playing!
      </div>

      <div v-else class="grid gap-2">
        <div
          v-for="pair in weakestPairs"
          :key="pair.pairId"
          class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
        >
          <div>
            <p class="font-medium">{{ pair.pairId }}</p>
            <p class="text-sm text-gray-500">{{ pair.topic }}</p>
          </div>
          <div class="text-right">
            <p
              class="font-semibold"
              :class="pair.accuracy < 50 ? 'text-red-500' : 'text-yellow-500'"
            >
              {{ pair.accuracy }}%
            </p>
            <p class="text-xs text-gray-500">{{ pair.attempts }} attempts</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Settings placeholder -->
    <section>
      <h2 class="mb-4 text-xl font-semibold">Settings</h2>

      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Theme</p>
            <p class="text-sm text-gray-500">Current: {{ theme }}</p>
          </div>
          <p class="text-sm text-gray-400">Toggle coming in next update</p>
        </div>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Add profile link to landing page**

In `app/pages/index.vue`, add a navigation link alongside the leaderboard link:

```vue
<NuxtLink
  to="/profile"
  class="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
>
  Profile
</NuxtLink>
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/profile.vue app/pages/index.vue
git commit -m "feat: add profile page with stats, accuracy trend, and weakest pairs"
```

---

### Task 10: Wire Adaptive Difficulty into Game Flow

**Files:**

- Modify: `app/pages/play/[slug].vue`
- Modify: `app/pages/topics/[slug].vue`

- [ ] **Step 1: Integrate adaptive level in play page**

In `app/pages/play/[slug].vue`, modify the level initialization to use adaptive adjustments:

```typescript
// Add at script setup:
const adaptive = useAdaptive()
const sr = useSpacedRepetition()

// Replace the static level lookup with adaptive version:
const currentLevel = ref<AdaptiveLevelAdjustment | null>(null)

async function initLevel(levelIndex: number) {
  const adjustment = await adaptive.getAdjustedLevel(slug, levelIndex)
  currentLevel.value = adjustment

  // Build pair selection with mixed difficulty
  const topicData = /* existing topic data fetch */
  const allPairIds = topicData.pairs.map((p: TopicPair) => p.id)
  const selectedIds = await adaptive.buildMixedSession(slug, allPairIds, adjustment.pairs)

  // Also consider spaced repetition for topic-practice mode
  const srSelected = await sr.selectPairsForSession(slug, allPairIds, adjustment.pairs)

  // Merge: use SR selection for topic-practice, adaptive for others
  const finalPairIds = route.path.includes('topics') ? srSelected : selectedIds
  const selectedPairs = topicData.pairs.filter((p: TopicPair) => finalPairIds.includes(p.id))

  // Initialize game with selected pairs and adjusted level
  init(selectedPairs, adjustment)
}
```

- [ ] **Step 2: Add card preview for easier difficulty**

In the game initialization flow, after `init()`, if `currentLevel.value.previewTime` is set:

```typescript
// After init, if preview time is set, show all cards briefly
if (currentLevel.value?.previewTime) {
  peekAll()
  setTimeout(() => {
    // Cards will auto-hide via useGame's peekAll timeout
    start() // start the timer after preview
  }, currentLevel.value.previewTime * 1000)
} else {
  start()
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/play/\[slug\].vue app/pages/topics/\[slug\].vue
git commit -m "feat: wire adaptive difficulty and spaced repetition into game flow"
```

---

### Task 11: Hydrate User Store on App Start

**Files:**

- Create: `app/plugins/user-store.client.ts`

- [ ] **Step 1: Create client plugin for store hydration**

Create `app/plugins/user-store.client.ts`:

```typescript
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  await userStore.hydrate()
})
```

- [ ] **Step 2: Commit**

```bash
git add app/plugins/user-store.client.ts
git commit -m "feat: hydrate user store from IndexedDB on client startup"
```

---

### Task 12: Final Integration Test

**Files:**

- Create: `tests/unit/integration-persistence.test.ts`

- [ ] **Step 1: Write integration test for the full persistence flow**

Create `tests/unit/integration-persistence.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { useIndexedDB } from '../../app/composables/useIndexedDB'
import { useSpacedRepetition } from '../../app/composables/useSpacedRepetition'
import { useAdaptive } from '../../app/composables/useAdaptive'
import { calculateSM2 } from '../../app/utils/sm2'
import type { StoredGameResult, SessionPerformance } from '../../app/types'

describe('persistence integration', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory()
    vi.useFakeTimers()
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
```

- [ ] **Step 2: Run all tests**

Run: `pnpm vitest run`
Expected: PASS — all tests green

- [ ] **Step 3: Commit**

```bash
git add tests/unit/integration-persistence.test.ts
git commit -m "test: add integration test for full persistence and adaptive flow"
```
