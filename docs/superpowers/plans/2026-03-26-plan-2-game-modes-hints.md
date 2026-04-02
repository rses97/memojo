# Plan 2: Game Modes & Hint System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Daily Challenge, Topic Practice with level progression, and an earned hint system (Peek + Eliminate) to the memory game.

**Architecture:** A seeded PRNG utility provides deterministic shuffles for Daily Challenge (same puzzle for all players on a given date, no backend). Topic Practice reuses `useGame` and `useTimer` with a level-progression wrapper composable `useTopicPractice`. The hint system extends `useGame` with `peekAll()` and `eliminatePair()` actions that deduct points. A topics manifest enables the listing page. The landing page becomes a mode-selection hub.

**Tech Stack:** Nuxt 4, TypeScript (strict), Tailwind CSS v4 (CSS-first), Pinia, Vitest + @nuxt/test-utils, @vue/test-utils

**Plan series:** This is Plan 2 of 4. Plan 1 established the foundation and quick-play mode. Plan 3 will add persistence (IndexedDB) and leaderboards. Plan 4 will add adaptive difficulty, spaced repetition, and CI/CD.

---

## File Structure (new/modified files)

```
memojo/
├── app/
│   ├── composables/
│   │   └── useTopicPractice.ts         # Level progression for topic practice
│   ├── components/
│   │   └── game/
│   │       ├── GameHints.vue           # Peek + Eliminate hint buttons
│   │       ├── GameLevelComplete.vue   # Between-level transition screen
│   │       └── GameModeCard.vue        # Mode card for landing page
│   ├── pages/
│   │   ├── index.vue                   # Updated: mode selection hub
│   │   ├── daily.vue                   # Daily challenge page
│   │   ├── topics/
│   │   │   ├── index.vue              # Topics listing
│   │   │   └── [slug].vue             # Topic detail + play
│   │   └── play/[slug].vue            # Modified: hint support
│   ├── types/index.ts                  # Modified: add HintState, GameMode types
│   └── utils/
│       ├── scoring.ts                  # Modified: hint penalty
│       └── seededRandom.ts             # Seeded PRNG + date seed
├── public/
│   └── topics/
│       └── index.json                  # Topic manifest
└── tests/
    └── unit/
        ├── seededRandom.test.ts        # Seeded random tests
        ├── useGame.hints.test.ts       # Hint system tests
        ├── useTopicPractice.test.ts    # Level progression tests
        └── scoring.test.ts             # Modified: hint penalty tests
```

---

### Task 1: Seeded Random Utility (TDD)

**Files:**

- Create: `app/utils/seededRandom.ts`
- Test: `tests/unit/seededRandom.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/seededRandom.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { dateSeed, seededShuffle } from '~/utils/seededRandom'

describe('dateSeed', () => {
  it('returns a deterministic integer for a given date', () => {
    const seed = dateSeed(new Date('2026-03-26'))
    expect(seed).toBe(20260326)
  })

  it('returns different seeds for different dates', () => {
    const seed1 = dateSeed(new Date('2026-03-26'))
    const seed2 = dateSeed(new Date('2026-03-27'))
    expect(seed1).not.toBe(seed2)
  })

  it('returns the same seed regardless of time-of-day', () => {
    const morning = dateSeed(new Date('2026-03-26T08:00:00'))
    const evening = dateSeed(new Date('2026-03-26T22:30:00'))
    expect(morning).toBe(evening)
  })
})

describe('seededShuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = seededShuffle(input, 42)
    expect(result).toHaveLength(5)
  })

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = seededShuffle(input, 42)
    expect(result.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    seededShuffle(input, 42)
    expect(input).toEqual(copy)
  })

  it('produces the same output for the same seed', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const result1 = seededShuffle(input, 12345)
    const result2 = seededShuffle(input, 12345)
    expect(result1).toEqual(result2)
  })

  it('produces different output for different seeds', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const result1 = seededShuffle(input, 12345)
    const result2 = seededShuffle(input, 54321)
    expect(result1).not.toEqual(result2)
  })

  it('handles empty array', () => {
    expect(seededShuffle([], 42)).toEqual([])
  })

  it('handles single-element array', () => {
    expect(seededShuffle([1], 42)).toEqual([1])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/seededRandom.test.ts`
Expected: FAIL with "Cannot find module" or similar import error

- [ ] **Step 3: Write minimal implementation**

Create `app/utils/seededRandom.ts`:

```typescript
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function dateSeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year * 10000 + month * 100 + day
}

export function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  const random = mulberry32(seed)

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/seededRandom.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add app/utils/seededRandom.ts tests/unit/seededRandom.test.ts
git commit -m "feat: add seeded random utility for deterministic shuffles"
```

---

### Task 2: Extend Types for Game Modes and Hints

**Files:**

- Modify: `app/types/index.ts`

- [ ] **Step 1: Add new types**

Add the following to `app/types/index.ts` (append after existing types):

```typescript
export type GameMode = 'quick-play' | 'daily' | 'topic-practice'

export interface HintState {
  peekAvailable: number
  eliminateAvailable: number
  peekUsed: number
  eliminateUsed: number
}

export const HINT_COSTS = {
  peek: 200,
  eliminate: 300,
} as const

export const INITIAL_HINTS: HintState = {
  peekAvailable: 1,
  eliminateAvailable: 1,
  peekUsed: 0,
  eliminateUsed: 0,
}

export interface TopicManifestEntry {
  slug: string
  name: string
  description: string
  pairCount: number
}
```

- [ ] **Step 2: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add GameMode, HintState, and TopicManifestEntry types"
```

---

### Task 3: Hint System in useGame (TDD)

**Files:**

- Modify: `app/composables/useGame.ts`
- Create: `tests/unit/useGame.hints.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/useGame.hints.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useGame.hints.test.ts`
Expected: FAIL with errors about missing `hints`, `peekAll`, `eliminatePair`, `isPeeking`, `isEliminated` properties

- [ ] **Step 3: Update GameCard type to support elimination**

In `app/types/index.ts`, update the `GameCard` interface:

```typescript
export interface GameCard {
  id: string
  pairId: string
  type: 'image' | 'text'
  content: string
  isFlipped: boolean
  isMatched: boolean
  isEliminated: boolean
}
```

- [ ] **Step 4: Write implementation — extend useGame**

Modify `app/composables/useGame.ts` to add hint support. The composable should add to its existing return object:

- `hints` — reactive `HintState`
- `isPeeking` — `Ref<boolean>`
- `peekAll()` — reveals all unmatched cards for 1 second, blocks interaction during peek
- `eliminatePair()` — marks one random unmatched pair as eliminated

Key implementation details to integrate into the existing composable:

```typescript
// Add to imports/types at top
import { INITIAL_HINTS } from '~/types'
import type { HintState } from '~/types'

// Add these reactive refs alongside existing ones
const hints = ref<HintState>({ ...INITIAL_HINTS })
const isPeeking = ref(false)

// In the existing init() function, when creating cards, add isEliminated: false
// to each card object alongside the existing isFlipped: false and isMatched: false.

// In the existing flipCard() function, add an early return:
// if (isPeeking.value) return

// In the existing flipCard() function, when finding flippable cards,
// also exclude eliminated cards: !c.isFlipped && !c.isMatched && !c.isEliminated

// Update totalPairs to account for eliminated pairs:
// const totalPairs = computed(() => {
//   const eliminated = cards.value.filter(c => c.isEliminated).length / 2
//   return Math.ceil(cards.value.length / 2) - eliminated
// })

// Add peekAll function
function peekAll() {
  if (hints.value.peekAvailable <= 0 || isPeeking.value) return

  isPeeking.value = true
  hints.value.peekAvailable--
  hints.value.peekUsed++

  cards.value.forEach((card) => {
    if (!card.isMatched && !card.isEliminated) {
      card.isFlipped = true
    }
  })

  setTimeout(() => {
    cards.value.forEach((card) => {
      if (!card.isMatched && !card.isEliminated) {
        card.isFlipped = false
      }
    })
    isPeeking.value = false
  }, 1000)
}

// Add eliminatePair function
function eliminatePair() {
  if (hints.value.eliminateAvailable <= 0) return

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

// In the existing reset() function, add:
// hints.value = { ...INITIAL_HINTS }
// isPeeking.value = false

// Add to the return object:
// hints, isPeeking, peekAll, eliminatePair
```

Apply all of the above changes to the existing `app/composables/useGame.ts`. The full composable should retain all existing functionality (`cards`, `matchedPairs`, `totalPairs`, `moves`, `streak`, `maxStreak`, `isComplete`, `isProcessing`, `init`, `flipCard`, `reset`) and add the new hint-related properties.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/useGame.hints.test.ts`
Expected: PASS (all 10 tests)

- [ ] **Step 6: Run existing useGame tests to verify no regression**

Run: `pnpm vitest run tests/unit/useGame.test.ts`
Expected: PASS (all existing tests still pass)

- [ ] **Step 7: Commit**

```bash
git add app/types/index.ts app/composables/useGame.ts tests/unit/useGame.hints.test.ts
git commit -m "feat: add peek and eliminate hint system to useGame composable"
```

---

### Task 4: Scoring with Hint Penalties (TDD)

**Files:**

- Modify: `app/utils/scoring.ts`
- Modify: `tests/unit/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to existing `tests/unit/scoring.test.ts` (add a new describe block):

```typescript
import { HINT_COSTS } from '~/types'

describe('calculateScore with hint penalties', () => {
  it('deducts peek cost from final score', () => {
    const baseScore = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 0, eliminate: 0 },
    })
    const withPeek = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 1, eliminate: 0 },
    })
    expect(withPeek).toBe(baseScore - HINT_COSTS.peek)
  })

  it('deducts eliminate cost from final score', () => {
    const baseScore = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 0, eliminate: 0 },
    })
    const withEliminate = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 0, eliminate: 1 },
    })
    expect(withEliminate).toBe(baseScore - HINT_COSTS.eliminate)
  })

  it('deducts both hint costs when both used', () => {
    const baseScore = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 0, eliminate: 0 },
    })
    const withBoth = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 1, eliminate: 1 },
    })
    expect(withBoth).toBe(baseScore - HINT_COSTS.peek - HINT_COSTS.eliminate)
  })

  it('never returns a negative score', () => {
    const score = calculateScore({
      moves: 100,
      totalPairs: 4,
      timeElapsed: 119,
      timeLimit: 120,
      maxStreak: 0,
      hintsUsed: { peek: 1, eliminate: 1 },
    })
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('works with no hintsUsed field (backward compatible)', () => {
    const score = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(score).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/scoring.test.ts`
Expected: FAIL because `calculateScore` does not accept `hintsUsed` parameter

- [ ] **Step 3: Update calculateScore implementation**

Modify `app/utils/scoring.ts`. Update the input parameter type and add hint penalty deduction:

```typescript
import { HINT_COSTS } from '~/types'

interface ScoreInput {
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
  hintsUsed?: { peek: number; eliminate: number }
}

export function calculateScore(input: ScoreInput): number {
  const { moves, totalPairs, timeElapsed, timeLimit, maxStreak, hintsUsed } =
    input

  const accuracy = Math.max(0, Math.min(1, totalPairs / moves))
  const accuracyScore = accuracy * 1000

  const speedRatio = Math.max(0, 1 - timeElapsed / timeLimit)
  const speedScore = speedRatio * 500

  const streakMultiplier = 1 + maxStreak * 0.1

  let total = Math.round((accuracyScore + speedScore) * streakMultiplier)

  if (hintsUsed) {
    total -= hintsUsed.peek * HINT_COSTS.peek
    total -= hintsUsed.eliminate * HINT_COSTS.eliminate
  }

  return Math.max(0, total)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/scoring.test.ts`
Expected: PASS (all existing + 5 new tests)

- [ ] **Step 5: Commit**

```bash
git add app/utils/scoring.ts tests/unit/scoring.test.ts
git commit -m "feat: add hint penalty deductions to scoring utility"
```

---

### Task 5: Topic Manifest

**Files:**

- Create: `public/topics/index.json`

- [ ] **Step 1: Create topics manifest**

Create `public/topics/index.json`:

```json
{
  "topics": [
    {
      "slug": "world-flags",
      "name": "World Flags",
      "description": "Match country flags to their names",
      "pairCount": 10
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add public/topics/index.json
git commit -m "feat: add topics manifest for topic listing page"
```

---

### Task 6: useTopicPractice Composable (TDD)

**Files:**

- Create: `app/composables/useTopicPractice.ts`
- Create: `tests/unit/useTopicPractice.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/useTopicPractice.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTopicPractice } from '~/composables/useTopicPractice'
import { LEVELS } from '~/types'
import type { TopicPair } from '~/types'

const testPairs: TopicPair[] = Array.from({ length: 12 }, (_, i) => ({
  id: `pair-${i}`,
  image: `/img/${i}.webp`,
  text: `Item ${i}`,
}))

describe('useTopicPractice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at level 0', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.currentLevelIndex.value).toBe(0)
  })

  it('provides current level config', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.currentLevel.value).toEqual(LEVELS[0])
  })

  it('selects correct number of pairs for current level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.selectedPairs.value).toHaveLength(LEVELS[0].pairs)
  })

  it('advances to next level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.advanceLevel()

    expect(practice.currentLevelIndex.value).toBe(1)
    expect(practice.currentLevel.value).toEqual(LEVELS[1])
    expect(practice.selectedPairs.value).toHaveLength(LEVELS[1].pairs)
  })

  it('reports not complete until all levels finished', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    expect(practice.isAllComplete.value).toBe(false)

    practice.advanceLevel()
    expect(practice.isAllComplete.value).toBe(false)

    practice.advanceLevel()
    expect(practice.isAllComplete.value).toBe(false)
  })

  it('reports complete after advancing past last level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.advanceLevel() // to level 1
    practice.advanceLevel() // to level 2
    practice.advanceLevel() // past last level

    expect(practice.isAllComplete.value).toBe(true)
  })

  it('tracks total score across levels', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.addLevelScore(500)
    practice.advanceLevel()
    practice.addLevelScore(700)
    practice.advanceLevel()

    expect(practice.totalScore.value).toBe(1200)
  })

  it('provides total level count', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.totalLevels.value).toBe(LEVELS.length)
  })

  it('resets to initial state', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    practice.advanceLevel()
    practice.addLevelScore(500)

    practice.reset()

    expect(practice.currentLevelIndex.value).toBe(0)
    expect(practice.totalScore.value).toBe(0)
    expect(practice.isAllComplete.value).toBe(false)
  })

  it('shows between-levels state', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    expect(practice.showLevelComplete.value).toBe(false)

    practice.completeLevelAndShow(300)
    expect(practice.showLevelComplete.value).toBe(true)
    expect(practice.lastLevelScore.value).toBe(300)

    practice.advanceLevel()
    expect(practice.showLevelComplete.value).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useTopicPractice.test.ts`
Expected: FAIL with "Cannot find module" or similar import error

- [ ] **Step 3: Write implementation**

Create `app/composables/useTopicPractice.ts`:

```typescript
import { LEVELS } from '~/types'
import type { TopicPair } from '~/types'

export function useTopicPractice() {
  const allPairs = ref<TopicPair[]>([])
  const currentLevelIndex = ref(0)
  const totalScore = ref(0)
  const showLevelComplete = ref(false)
  const lastLevelScore = ref(0)

  const currentLevel = computed(() => LEVELS[currentLevelIndex.value])

  const isAllComplete = computed(() => currentLevelIndex.value >= LEVELS.length)

  const totalLevels = computed(() => LEVELS.length)

  const selectedPairs = computed(() => {
    if (isAllComplete.value) return []
    const count = currentLevel.value.pairs
    return allPairs.value.slice(0, count)
  })

  function start(pairs: TopicPair[]) {
    allPairs.value = [...pairs]
    currentLevelIndex.value = 0
    totalScore.value = 0
    showLevelComplete.value = false
    lastLevelScore.value = 0
  }

  function advanceLevel() {
    showLevelComplete.value = false
    currentLevelIndex.value++
  }

  function addLevelScore(score: number) {
    totalScore.value += score
  }

  function completeLevelAndShow(score: number) {
    lastLevelScore.value = score
    addLevelScore(score)
    showLevelComplete.value = true
  }

  function reset() {
    currentLevelIndex.value = 0
    totalScore.value = 0
    showLevelComplete.value = false
    lastLevelScore.value = 0
  }

  return {
    currentLevelIndex: readonly(currentLevelIndex),
    currentLevel,
    selectedPairs,
    isAllComplete,
    totalLevels,
    totalScore: readonly(totalScore),
    showLevelComplete: readonly(showLevelComplete),
    lastLevelScore: readonly(lastLevelScore),
    start,
    advanceLevel,
    addLevelScore,
    completeLevelAndShow,
    reset,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/useTopicPractice.test.ts`
Expected: PASS (all 10 tests)

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTopicPractice.ts tests/unit/useTopicPractice.test.ts
git commit -m "feat: add useTopicPractice composable for level progression"
```

---

### Task 7: GameHints Component

**Files:**

- Create: `app/components/game/GameHints.vue`

- [ ] **Step 1: Create the hints UI component**

Create `app/components/game/GameHints.vue`:

```vue
<script setup lang="ts">
import type { HintState } from '~/types'

const props = defineProps<{
  hints: HintState
  isPeeking: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  peek: []
  eliminate: []
}>()

const canPeek = computed(
  () => props.hints.peekAvailable > 0 && !props.isPeeking && !props.disabled,
)
const canEliminate = computed(
  () =>
    props.hints.eliminateAvailable > 0 && !props.isPeeking && !props.disabled,
)
</script>

<template>
  <div class="flex gap-3">
    <button
      :disabled="!canPeek"
      class="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-surface-800 dark:hover:bg-surface-700"
      @click="emit('peek')"
    >
      <span class="text-base" aria-hidden="true">👁</span>
      <span>Peek</span>
      <span
        class="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
      >
        {{ hints.peekAvailable }}
      </span>
    </button>

    <button
      :disabled="!canEliminate"
      class="flex items-center gap-2 rounded-lg bg-surface-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-surface-800 dark:hover:bg-surface-700"
      @click="emit('eliminate')"
    >
      <span class="text-base" aria-hidden="true">✂</span>
      <span>Eliminate</span>
      <span
        class="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
      >
        {{ hints.eliminateAvailable }}
      </span>
    </button>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/game/GameHints.vue
git commit -m "feat: add GameHints component with peek and eliminate buttons"
```

---

### Task 8: GameLevelComplete Component

**Files:**

- Create: `app/components/game/GameLevelComplete.vue`

- [ ] **Step 1: Create level-complete transition screen**

Create `app/components/game/GameLevelComplete.vue`:

```vue
<script setup lang="ts">
defineProps<{
  levelIndex: number
  totalLevels: number
  score: number
  isLastLevel: boolean
}>()

const emit = defineEmits<{
  next: []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-6 rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
  >
    <div class="text-4xl font-bold text-primary-500">
      Level {{ levelIndex + 1 }} Complete!
    </div>

    <div class="text-lg text-surface-700 dark:text-surface-200">
      Score:
      <span class="font-bold text-primary-600 dark:text-primary-400">{{
        score
      }}</span>
    </div>

    <div class="text-sm text-surface-500 dark:text-surface-400">
      {{ levelIndex + 1 }} / {{ totalLevels }} levels completed
    </div>

    <button
      class="rounded-xl bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
      @click="emit('next')"
    >
      {{ isLastLevel ? 'View Results' : 'Next Level' }}
    </button>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/game/GameLevelComplete.vue
git commit -m "feat: add GameLevelComplete transition screen component"
```

---

### Task 9: GameModeCard Component

**Files:**

- Create: `app/components/game/GameModeCard.vue`

- [ ] **Step 1: Create mode selection card**

Create `app/components/game/GameModeCard.vue`:

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
  to: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col gap-3 rounded-2xl bg-surface-50 p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-surface-800"
  >
    <span class="text-4xl" aria-hidden="true">{{ icon }}</span>
    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-50">
      {{ title }}
    </h2>
    <p class="text-sm text-surface-600 dark:text-surface-400">
      {{ description }}
    </p>
    <span
      class="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-500 transition-colors group-hover:text-primary-600"
    >
      Play
      <span aria-hidden="true">&rarr;</span>
    </span>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/game/GameModeCard.vue
git commit -m "feat: add GameModeCard component for landing page"
```

---

### Task 10: Update Landing Page with Mode Selection

**Files:**

- Modify: `app/pages/index.vue`

- [ ] **Step 1: Rewrite landing page as mode-selection hub**

Replace `app/pages/index.vue`:

```vue
<script setup lang="ts">
const modes = [
  {
    title: 'Daily Challenge',
    description:
      'A new puzzle every day. Same cards for everyone — compare your score!',
    icon: '📅',
    to: '/daily',
  },
  {
    title: 'Topic Practice',
    description:
      'Pick a topic and master it through three progressively harder levels.',
    icon: '📚',
    to: '/topics',
  },
  {
    title: 'Quick Play',
    description: 'Jump right in with random cards. No pressure, just practice.',
    icon: '⚡',
    to: '/play/world-flags',
  },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="mb-12 text-center">
      <h1 class="mb-3 text-4xl font-bold text-surface-900 dark:text-surface-50">
        Memojo
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Match images to text. Train your memory. Beat your best.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-3">
      <GameModeCard
        v-for="mode in modes"
        :key="mode.to"
        :title="mode.title"
        :description="mode.description"
        :icon="mode.icon"
        :to="mode.to"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: update landing page with game mode selection cards"
```

---

### Task 11: Daily Challenge Page

**Files:**

- Create: `app/pages/daily.vue`

- [ ] **Step 1: Create daily challenge page**

Create `app/pages/daily.vue`:

```vue
<script setup lang="ts">
import { dateSeed, seededShuffle } from '~/utils/seededRandom'
import { calculateScore } from '~/utils/scoring'
import { LEVELS } from '~/types'
import type { TopicPack, TopicPair } from '~/types'

const game = useGame()
const timer = useTimer()

const level = LEVELS[1] // Daily uses level 2 (6 pairs, 90s)
const isLoading = ref(true)
const isGameOver = ref(false)
const finalScore = ref(0)

const todaySeed = dateSeed(new Date())
const formattedDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

async function loadAndStart() {
  const data = await $fetch<TopicPack>('/topics/world-flags.json')

  const shuffledPairs = seededShuffle(data.pairs, todaySeed)
  const selectedPairs = shuffledPairs.slice(0, level.pairs)

  game.init(selectedPairs, todaySeed)
  timer.init(level.timeLimit)
  timer.start()
  isLoading.value = false
}

function handleFlip(cardId: string) {
  if (isGameOver.value) return
  game.flipCard(cardId)
}

watch(
  () => timer.isExpired.value,
  (expired) => {
    if (expired) {
      endGame()
    }
  },
)

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) {
      timer.pause()
      endGame()
    }
  },
)

function endGame() {
  isGameOver.value = true
  finalScore.value = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
    hintsUsed: {
      peek: game.hints.value.peekUsed,
      eliminate: game.hints.value.eliminateUsed,
    },
  })
}

onMounted(() => {
  loadAndStart()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 text-center">
      <h1 class="mb-1 text-2xl font-bold text-surface-900 dark:text-surface-50">
        Daily Challenge
      </h1>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        {{ formattedDate }}
      </p>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-surface-500">
      Loading today's challenge...
    </div>

    <template v-else>
      <GameHud
        :moves="game.moves.value"
        :matched-pairs="game.matchedPairs.value"
        :total-pairs="game.totalPairs.value"
        :time-remaining="timer.remaining.value"
        :streak="game.streak.value"
      />

      <GameHints
        class="my-4 flex justify-center"
        :hints="game.hints.value"
        :is-peeking="game.isPeeking.value"
        :disabled="isGameOver"
        @peek="game.peekAll()"
        @eliminate="game.eliminatePair()"
      />

      <GameBoard
        :cards="game.cards.value"
        :grid-cols="level.gridCols"
        :disabled="
          game.isProcessing.value || game.isPeeking.value || isGameOver
        "
        @flip="handleFlip"
      />

      <div
        v-if="isGameOver"
        class="mt-8 rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
      >
        <h2 class="mb-2 text-3xl font-bold text-primary-500">
          {{ game.isComplete.value ? 'Challenge Complete!' : "Time's Up!" }}
        </h2>
        <p class="mb-4 text-lg text-surface-700 dark:text-surface-200">
          Score: <span class="font-bold">{{ finalScore }}</span>
        </p>
        <p class="text-sm text-surface-500">
          {{ game.matchedPairs.value }} / {{ game.totalPairs.value }} pairs
          matched in {{ game.moves.value }} moves
        </p>
        <NuxtLink
          to="/"
          class="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to Menu
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Update useGame.init to accept optional seed**

In `app/composables/useGame.ts`, update the `init` function signature to accept an optional seed for deterministic card shuffling:

```typescript
function init(pairs: TopicPair[], seed?: number) {
  // ... existing card creation logic ...

  // Replace the existing Math.random() shuffle with:
  if (seed !== undefined) {
    const { seededShuffle } = await import('~/utils/seededRandom')
    // Actually, since composables should stay synchronous, use inline shuffle:
    cards.value = seededShuffle(createdCards, seed)
  } else {
    // existing Fisher-Yates shuffle with Math.random()
    for (let i = createdCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[createdCards[i], createdCards[j]] = [createdCards[j], createdCards[i]]
    }
    cards.value = createdCards
  }
}
```

Import `seededShuffle` at the top of the composable file:

```typescript
import { seededShuffle } from '~/utils/seededRandom'
```

Then the init function becomes:

```typescript
function init(pairs: TopicPair[], seed?: number) {
  const createdCards: GameCard[] = []

  for (const pair of pairs) {
    createdCards.push({
      id: `${pair.id}-image`,
      pairId: pair.id,
      type: 'image',
      content: pair.image,
      isFlipped: false,
      isMatched: false,
      isEliminated: false,
    })
    createdCards.push({
      id: `${pair.id}-text`,
      pairId: pair.id,
      type: 'text',
      content: pair.text,
      isFlipped: false,
      isMatched: false,
      isEliminated: false,
    })
  }

  if (seed !== undefined) {
    cards.value = seededShuffle(createdCards, seed)
  } else {
    for (let i = createdCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[createdCards[i], createdCards[j]] = [createdCards[j], createdCards[i]]
    }
    cards.value = createdCards
  }

  moves.value = 0
  streak.value = 0
  maxStreak.value = 0
  hints.value = { ...INITIAL_HINTS }
  isPeeking.value = false
}
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/daily.vue app/composables/useGame.ts
git commit -m "feat: add daily challenge page with seeded random shuffle"
```

---

### Task 12: Topics Listing Page

**Files:**

- Create: `app/pages/topics/index.vue`

- [ ] **Step 1: Create topics listing page**

Create `app/pages/topics/index.vue`:

```vue
<script setup lang="ts">
import type { TopicManifestEntry } from '~/types'

const { data: manifest } = await useFetch<{ topics: TopicManifestEntry[] }>(
  '/topics/index.json',
)

const topics = computed(() => manifest.value?.topics ?? [])
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="mb-8">
      <NuxtLink to="/" class="text-sm text-primary-500 hover:text-primary-600">
        &larr; Back to menu
      </NuxtLink>
      <h1 class="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
        Topic Practice
      </h1>
      <p class="mt-1 text-surface-600 dark:text-surface-400">
        Choose a topic and master it through three levels of increasing
        difficulty.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.slug"
        :to="`/topics/${topic.slug}`"
        class="group rounded-xl bg-surface-50 p-5 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-surface-800"
      >
        <h2
          class="mb-1 text-lg font-bold text-surface-900 group-hover:text-primary-500 dark:text-surface-50"
        >
          {{ topic.name }}
        </h2>
        <p class="mb-3 text-sm text-surface-600 dark:text-surface-400">
          {{ topic.description }}
        </p>
        <span class="text-xs text-surface-500 dark:text-surface-400">
          {{ topic.pairCount }} pairs &middot; 3 levels
        </span>
      </NuxtLink>
    </div>

    <div v-if="topics.length === 0" class="py-20 text-center text-surface-500">
      No topics available yet.
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/topics/index.vue
git commit -m "feat: add topics listing page"
```

---

### Task 13: Topic Practice Play Page

**Files:**

- Create: `app/pages/topics/[slug].vue`

- [ ] **Step 1: Create topic practice page with level progression**

Create `app/pages/topics/[slug].vue`:

```vue
<script setup lang="ts">
import { calculateScore } from '~/utils/scoring'
import type { TopicPack } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

const game = useGame()
const timer = useTimer()
const practice = useTopicPractice()

const isLoading = ref(true)
const isGameOver = ref(false)
const topicData = ref<TopicPack | null>(null)
const hasPreview = ref(false)

async function loadTopic() {
  topicData.value = await $fetch<TopicPack>(`/topics/${slug}.json`)
  practice.start(topicData.value.pairs)
  startCurrentLevel()
  isLoading.value = false
}

function startCurrentLevel() {
  if (practice.isAllComplete.value) return

  const level = practice.currentLevel.value
  const pairs = practice.selectedPairs.value

  game.init(pairs)
  timer.init(level.timeLimit)

  if (level.previewTime) {
    hasPreview.value = true
    // Flip all cards for preview
    game.cards.value.forEach((card) => {
      card.isFlipped = true
    })
    setTimeout(() => {
      game.cards.value.forEach((card) => {
        card.isFlipped = false
      })
      hasPreview.value = false
      timer.start()
    }, level.previewTime * 1000)
  } else {
    hasPreview.value = false
    timer.start()
  }

  isGameOver.value = false
}

function handleFlip(cardId: string) {
  if (isGameOver.value || hasPreview.value) return
  game.flipCard(cardId)
}

watch(
  () => timer.isExpired.value,
  (expired) => {
    if (expired) {
      handleLevelEnd()
    }
  },
)

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) {
      timer.pause()
      handleLevelEnd()
    }
  },
)

function handleLevelEnd() {
  isGameOver.value = true
  const level = practice.currentLevel.value
  const score = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
    hintsUsed: {
      peek: game.hints.value.peekUsed,
      eliminate: game.hints.value.eliminateUsed,
    },
  })
  practice.completeLevelAndShow(score)
}

function handleNext() {
  practice.advanceLevel()
  if (!practice.isAllComplete.value) {
    startCurrentLevel()
  }
}

function handleRestart() {
  if (topicData.value) {
    practice.start(topicData.value.pairs)
    startCurrentLevel()
  }
}

onMounted(() => {
  loadTopic()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6">
      <NuxtLink
        to="/topics"
        class="text-sm text-primary-500 hover:text-primary-600"
      >
        &larr; Back to topics
      </NuxtLink>
      <h1
        v-if="topicData"
        class="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50"
      >
        {{ topicData.name }}
      </h1>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-surface-500">
      Loading topic...
    </div>

    <template v-else-if="practice.isAllComplete.value">
      <div
        class="rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
      >
        <h2 class="mb-4 text-3xl font-bold text-primary-500">
          All Levels Complete!
        </h2>
        <p class="mb-2 text-lg text-surface-700 dark:text-surface-200">
          Total Score:
          <span class="font-bold">{{ practice.totalScore.value }}</span>
        </p>
        <p class="mb-6 text-sm text-surface-500">
          You completed all {{ practice.totalLevels.value }} levels.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
            @click="handleRestart"
          >
            Play Again
          </button>
          <NuxtLink
            to="/topics"
            class="rounded-xl bg-surface-200 px-6 py-3 font-semibold text-surface-700 transition-colors hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600"
          >
            Other Topics
          </NuxtLink>
        </div>
      </div>
    </template>

    <template v-else-if="practice.showLevelComplete.value">
      <GameLevelComplete
        :level-index="practice.currentLevelIndex.value"
        :total-levels="practice.totalLevels.value"
        :score="practice.lastLevelScore.value"
        :is-last-level="
          practice.currentLevelIndex.value >= practice.totalLevels.value - 1
        "
        @next="handleNext"
      />
    </template>

    <template v-else>
      <div
        class="mb-4 text-center text-sm font-medium text-surface-500 dark:text-surface-400"
      >
        Level {{ practice.currentLevelIndex.value + 1 }} /
        {{ practice.totalLevels.value }}
      </div>

      <div
        v-if="hasPreview"
        class="mb-4 text-center text-sm font-medium text-primary-500"
      >
        Memorize the cards...
      </div>

      <GameHud
        :moves="game.moves.value"
        :matched-pairs="game.matchedPairs.value"
        :total-pairs="game.totalPairs.value"
        :time-remaining="timer.remaining.value"
        :streak="game.streak.value"
      />

      <GameHints
        class="my-4 flex justify-center"
        :hints="game.hints.value"
        :is-peeking="game.isPeeking.value"
        :disabled="isGameOver || hasPreview"
        @peek="game.peekAll()"
        @eliminate="game.eliminatePair()"
      />

      <GameBoard
        :cards="game.cards.value"
        :grid-cols="practice.currentLevel.value.gridCols"
        :disabled="
          game.isProcessing.value ||
          game.isPeeking.value ||
          isGameOver ||
          hasPreview
        "
        @flip="handleFlip"
      />
    </template>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/topics/[slug].vue
git commit -m "feat: add topic practice page with level progression and preview"
```

---

### Task 14: Update Quick Play Page with Hints

**Files:**

- Modify: `app/pages/play/[slug].vue`

- [ ] **Step 1: Add hint support to quick play page**

Update `app/pages/play/[slug].vue` to include the `GameHints` component and pass hint-related data. Add the following changes to the existing page:

In the `<script setup>` section, update the score calculation to include hints:

```typescript
// In the endGame or score calculation section, update to:
const score = calculateScore({
  moves: game.moves.value,
  totalPairs: game.totalPairs.value,
  timeElapsed: timer.elapsed.value,
  timeLimit: level.timeLimit,
  maxStreak: game.maxStreak.value,
  hintsUsed: {
    peek: game.hints.value.peekUsed,
    eliminate: game.hints.value.eliminateUsed,
  },
})
```

In the `<template>` section, add the `GameHints` component between `GameHud` and `GameBoard`:

```vue
<GameHints
  class="my-4 flex justify-center"
  :hints="game.hints.value"
  :is-peeking="game.isPeeking.value"
  :disabled="isGameOver"
  @peek="game.peekAll()"
  @eliminate="game.eliminatePair()"
/>
```

Also update the `GameBoard` disabled prop to include `game.isPeeking.value`:

```vue
<GameBoard
  :cards="game.cards.value"
  :grid-cols="level.gridCols"
  :disabled="game.isProcessing.value || game.isPeeking.value || isGameOver"
  @flip="handleFlip"
/>
```

The full updated `app/pages/play/[slug].vue`:

```vue
<script setup lang="ts">
import { calculateScore } from '~/utils/scoring'
import { LEVELS } from '~/types'
import type { TopicPack } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

const game = useGame()
const timer = useTimer()

const level = LEVELS[0]
const isLoading = ref(true)
const isGameOver = ref(false)
const finalScore = ref(0)

async function loadAndStart() {
  const data = await $fetch<TopicPack>(`/topics/${slug}.json`)

  const shuffled = [...data.pairs].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, level.pairs)

  game.init(selected)
  timer.init(level.timeLimit)
  timer.start()
  isLoading.value = false
}

function handleFlip(cardId: string) {
  if (isGameOver.value) return
  game.flipCard(cardId)
}

watch(
  () => timer.isExpired.value,
  (expired) => {
    if (expired) {
      endGame()
    }
  },
)

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) {
      timer.pause()
      endGame()
    }
  },
)

function endGame() {
  isGameOver.value = true
  finalScore.value = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
    hintsUsed: {
      peek: game.hints.value.peekUsed,
      eliminate: game.hints.value.eliminateUsed,
    },
  })
}

onMounted(() => {
  loadAndStart()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/" class="text-sm text-primary-500 hover:text-primary-600">
        &larr; Back to menu
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50">
        Quick Play
      </h1>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-surface-500">
      Loading...
    </div>

    <template v-else>
      <GameHud
        :moves="game.moves.value"
        :matched-pairs="game.matchedPairs.value"
        :total-pairs="game.totalPairs.value"
        :time-remaining="timer.remaining.value"
        :streak="game.streak.value"
      />

      <GameHints
        class="my-4 flex justify-center"
        :hints="game.hints.value"
        :is-peeking="game.isPeeking.value"
        :disabled="isGameOver"
        @peek="game.peekAll()"
        @eliminate="game.eliminatePair()"
      />

      <GameBoard
        :cards="game.cards.value"
        :grid-cols="level.gridCols"
        :disabled="
          game.isProcessing.value || game.isPeeking.value || isGameOver
        "
        @flip="handleFlip"
      />

      <div
        v-if="isGameOver"
        class="mt-8 rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800"
      >
        <h2 class="mb-2 text-3xl font-bold text-primary-500">
          {{ game.isComplete.value ? 'Well Done!' : "Time's Up!" }}
        </h2>
        <p class="mb-4 text-lg text-surface-700 dark:text-surface-200">
          Score: <span class="font-bold">{{ finalScore }}</span>
        </p>
        <p class="text-sm text-surface-500">
          {{ game.matchedPairs.value }} / {{ game.totalPairs.value }} pairs in
          {{ game.moves.value }} moves
        </p>
        <div class="mt-6 flex justify-center gap-4">
          <button
            class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
            @click="loadAndStart()"
          >
            Play Again
          </button>
          <NuxtLink
            to="/"
            class="rounded-xl bg-surface-200 px-6 py-3 font-semibold text-surface-700 transition-colors hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600"
          >
            Menu
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/play/[slug].vue
git commit -m "feat: add hint support and scoring penalties to quick play page"
```

---

### Task 15: Update GameBoard to Handle Eliminated Cards

**Files:**

- Modify: `app/components/game/GameBoard.vue`

- [ ] **Step 1: Filter out eliminated cards in the board**

Update `app/components/game/GameBoard.vue` to hide eliminated cards. In the template, filter cards to exclude eliminated ones, or apply a hidden/invisible style:

```vue
<script setup lang="ts">
import type { GameCard } from '~/types'

defineProps<{
  cards: GameCard[]
  gridCols: number
  disabled: boolean
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()

const visibleCards = computed(
  () =>
    // Keep all cards to preserve grid layout, but mark eliminated ones
    // so GameCard can render them as invisible placeholders
    props.cards,
)
</script>

<template>
  <div
    class="grid gap-3"
    :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }"
  >
    <div
      v-for="card in cards"
      :key="card.id"
      :class="{ invisible: card.isEliminated }"
    >
      <GameCard
        v-if="!card.isEliminated"
        :card="card"
        :disabled="disabled"
        @flip="emit('flip', card.id)"
      />
      <div v-else class="aspect-[3/4]" />
    </div>
  </div>
</template>
```

Note: If the existing `GameBoard.vue` already has a different structure, integrate the `isEliminated` check into whatever iteration/rendering pattern is already in place. The key change is: eliminated cards should render as invisible placeholders (preserving grid layout) rather than being removed from the DOM.

- [ ] **Step 2: Commit**

```bash
git add app/components/game/GameBoard.vue
git commit -m "feat: handle eliminated cards as invisible placeholders in game board"
```

---

### Task 16: Run Full Test Suite

- [ ] **Step 1: Run all tests**

Run: `pnpm vitest run`
Expected: All tests pass (existing + new)

- [ ] **Step 2: Run dev server smoke test**

Run: `pnpm dev`

Manually verify:

- Landing page shows three mode cards (Daily Challenge, Topic Practice, Quick Play)
- `/daily` loads and starts a game with hints available
- `/topics` shows the world-flags topic
- `/topics/world-flags` starts level 1 and progresses through levels
- `/play/world-flags` works with hint buttons visible
- Peek reveals all cards for 1 second then hides them
- Eliminate removes a pair from the grid

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: plan 2 complete — game modes, hints, and level progression"
```
