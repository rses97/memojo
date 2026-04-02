# Plan 1: Foundation + Core Game + Quick Play

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable memory game where players match image-text pairs from a topic pack in a quick-play session.

**Architecture:** Nuxt 4 app with composable-driven game logic. A `useGame` composable owns all matching/flip logic, a `useTimer` composable handles countdown, and a scoring utility calculates results. Components are thin renderers. Topic data is static JSON served from `public/`.

**Tech Stack:** Nuxt 4, TypeScript (strict), Tailwind CSS v4 (CSS-first), Pinia, Vitest + @nuxt/test-utils, @vue/test-utils

**Plan series:** This is Plan 1 of 4. Subsequent plans add game modes, persistence, adaptive difficulty, SSR pages, and CI/CD.

---

## File Structure

```
memojo/
├── app/
│   ├── assets/css/main.css              # Tailwind @import + @theme tokens
│   ├── components/
│   │   └── game/
│   │       ├── GameCard.vue             # Single card with flip animation
│   │       ├── GameBoard.vue            # Card grid layout
│   │       └── GameHud.vue              # Score, timer, matches display
│   ├── composables/
│   │   ├── useGame.ts                   # Core game logic (init, flip, match)
│   │   └── useTimer.ts                  # Countdown timer
│   ├── layouts/default.vue              # App shell
│   ├── pages/
│   │   ├── index.vue                    # Landing page with Quick Play link
│   │   └── play/[slug].vue              # Game screen
│   ├── types/index.ts                   # Shared TypeScript types
│   └── utils/scoring.ts                 # Score calculation
├── public/
│   └── topics/
│       └── world-flags.json             # First topic pack (10 pairs)
├── tests/
│   ├── unit/
│   │   ├── scoring.test.ts              # Scoring utility tests
│   │   ├── useGame.test.ts              # Game composable tests
│   │   └── useTimer.test.ts             # Timer composable tests
│   └── components/
│       └── GameCard.test.ts             # Card component tests
├── nuxt.config.ts
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

---

### Task 1: Project Scaffolding & Configuration

**Files:**

- Create: `nuxt.config.ts`, `package.json`, `vitest.config.ts`, `app/assets/css/main.css`, `app/app.vue`

- [ ] **Step 1: Initialize Nuxt project**

```bash
npx nuxi@latest init memojo --packageManager pnpm --gitInit
cd memojo
```

If the project directory already exists (non-empty), run inside it:

```bash
npx nuxi@latest init . --packageManager pnpm --gitInit --force
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add tailwindcss @tailwindcss/vite pinia @pinia/nuxt
pnpm add -D @nuxt/test-utils vitest @vue/test-utils happy-dom
```

- [ ] **Step 3: Configure nuxt.config.ts**

Replace the generated `nuxt.config.ts` with:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  modules: ['@pinia/nuxt', '@nuxt/test-utils/module'],

  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 4: Create Tailwind CSS theme**

Create `app/assets/css/main.css`:

```css
@import 'tailwindcss';

@theme {
  --color-primary-50: oklch(0.97 0.01 260);
  --color-primary-100: oklch(0.93 0.03 260);
  --color-primary-200: oklch(0.87 0.06 260);
  --color-primary-300: oklch(0.78 0.1 260);
  --color-primary-400: oklch(0.68 0.15 260);
  --color-primary-500: oklch(0.55 0.2 260);
  --color-primary-600: oklch(0.48 0.2 260);
  --color-primary-700: oklch(0.4 0.18 260);
  --color-primary-800: oklch(0.33 0.14 260);
  --color-primary-900: oklch(0.25 0.1 260);

  --color-surface-50: oklch(0.98 0.005 260);
  --color-surface-100: oklch(0.95 0.01 260);
  --color-surface-200: oklch(0.9 0.015 260);
  --color-surface-700: oklch(0.35 0.03 260);
  --color-surface-800: oklch(0.25 0.025 260);
  --color-surface-900: oklch(0.18 0.02 260);

  --color-success: oklch(0.65 0.18 145);
  --color-danger: oklch(0.6 0.2 25);

  --radius-card: 0.75rem;

  --ease-flip: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
  },
})
```

- [ ] **Step 6: Update app/app.vue**

Replace the generated `app/app.vue`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 7: Add test script to package.json**

Add to the `"scripts"` section in `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

Keep any existing scripts (`dev`, `build`, etc.) that `nuxi init` generated.

- [ ] **Step 8: Verify setup**

```bash
pnpm dev
```

Expected: Dev server starts without errors. Visit `http://localhost:3000` and see the default Nuxt page.

```bash
pnpm test:run
```

Expected: Vitest runs with 0 tests (no test files yet), exits cleanly.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: scaffold Nuxt 4 project with Tailwind v4, Pinia, Vitest"
```

---

### Task 2: TypeScript Types

**Files:**

- Create: `app/types/index.ts`

- [ ] **Step 1: Define all shared types**

Create `app/types/index.ts`:

```typescript
export interface TopicPair {
  id: string
  image: string
  text: string
  hint?: string
}

export interface TopicPack {
  topic: string
  name: string
  description: string
  pairs: TopicPair[]
}

export interface GameCard {
  id: string
  pairId: string
  type: 'image' | 'text'
  content: string
  isFlipped: boolean
  isMatched: boolean
}

export interface GameLevel {
  pairs: number
  gridCols: number
  timeLimit: number
  previewTime?: number
}

export interface GameResult {
  score: number
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
}

export const LEVELS: GameLevel[] = [
  { pairs: 4, gridCols: 4, timeLimit: 120 },
  { pairs: 6, gridCols: 4, timeLimit: 90 },
  { pairs: 9, gridCols: 6, timeLimit: 75, previewTime: 3 },
]
```

- [ ] **Step 2: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add shared TypeScript types for game entities"
```

---

### Task 3: World Flags Topic Pack

**Files:**

- Create: `public/topics/world-flags.json`

- [ ] **Step 1: Create topic pack JSON**

Create `public/topics/world-flags.json`:

```json
{
  "topic": "world-flags",
  "name": "World Flags",
  "description": "Match country flags to their names",
  "pairs": [
    {
      "id": "ua",
      "image": "/img/flags/ua.webp",
      "text": "Ukraine",
      "hint": "Eastern Europe"
    },
    {
      "id": "jp",
      "image": "/img/flags/jp.webp",
      "text": "Japan",
      "hint": "East Asia"
    },
    {
      "id": "br",
      "image": "/img/flags/br.webp",
      "text": "Brazil",
      "hint": "South America"
    },
    {
      "id": "ca",
      "image": "/img/flags/ca.webp",
      "text": "Canada",
      "hint": "North America"
    },
    {
      "id": "fr",
      "image": "/img/flags/fr.webp",
      "text": "France",
      "hint": "Western Europe"
    },
    {
      "id": "au",
      "image": "/img/flags/au.webp",
      "text": "Australia",
      "hint": "Oceania"
    },
    {
      "id": "ke",
      "image": "/img/flags/ke.webp",
      "text": "Kenya",
      "hint": "East Africa"
    },
    {
      "id": "mx",
      "image": "/img/flags/mx.webp",
      "text": "Mexico",
      "hint": "North America"
    },
    {
      "id": "in",
      "image": "/img/flags/in.webp",
      "text": "India",
      "hint": "South Asia"
    },
    {
      "id": "de",
      "image": "/img/flags/de.webp",
      "text": "Germany",
      "hint": "Central Europe"
    }
  ]
}
```

- [ ] **Step 2: Create placeholder flag images**

For development, create simple SVG placeholder flags:

```bash
mkdir -p public/img/flags
```

Create `public/img/flags/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
  <rect width="120" height="80" fill="#e2e8f0" rx="4"/>
  <text x="60" y="44" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b">Flag</text>
</svg>
```

Copy this placeholder for each flag code. Real flag images will be added later:

```bash
for code in ua jp br ca fr au ke mx in de; do
  cp public/img/flags/placeholder.svg "public/img/flags/${code}.webp"
done
```

Note: These are SVG files with `.webp` extension as placeholders. Replace with real WebP flag images before production.

- [ ] **Step 3: Commit**

```bash
git add public/topics/ public/img/
git commit -m "feat: add world-flags topic pack with placeholder images"
```

---

### Task 4: Scoring Utility (TDD)

**Files:**

- Create: `app/utils/scoring.ts`
- Test: `tests/unit/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/scoring.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateScore } from '~/utils/scoring'

describe('calculateScore', () => {
  it('returns maximum accuracy score for perfect play (one move per pair)', () => {
    const score = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 4,
    })
    // Perfect accuracy (1.0) × 1000 = 1000 base
    // Speed: (1 - 60/120) = 0.5 × 500 = 250
    // Streak: 1 + 4 × 0.1 = 1.4
    // Total: (1000 + 250) × 1.4 = 1750
    expect(score).toBe(1750)
  })

  it('reduces score for extra moves', () => {
    const perfect = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    const imperfect = calculateScore({
      moves: 8,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(imperfect).toBeLessThan(perfect)
  })

  it('rewards faster completion', () => {
    const fast = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 10,
      timeLimit: 120,
      maxStreak: 0,
    })
    const slow = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 100,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(fast).toBeGreaterThan(slow)
  })

  it('applies streak multiplier', () => {
    const noStreak = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    const withStreak = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 5,
    })
    expect(withStreak).toBeGreaterThan(noStreak)
  })

  it('never returns a negative score', () => {
    const score = calculateScore({
      moves: 100,
      totalPairs: 4,
      timeElapsed: 120,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('returns zero when time is fully expired and accuracy is zero', () => {
    const score = calculateScore({
      moves: 100,
      totalPairs: 4,
      timeElapsed: 120,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(score).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/unit/scoring.test.ts
```

Expected: FAIL — `calculateScore` is not defined.

- [ ] **Step 3: Write the implementation**

Create `app/utils/scoring.ts`:

```typescript
export interface ScoreParams {
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
}

export function calculateScore(params: ScoreParams): number {
  const { moves, totalPairs, timeElapsed, timeLimit, maxStreak } = params

  const perfectMoves = totalPairs
  const accuracy = Math.max(0, 1 - (moves - perfectMoves) / (perfectMoves * 2))
  const accuracyScore = accuracy * 1000

  const timeRatio = Math.max(0, 1 - timeElapsed / timeLimit)
  const speedScore = timeRatio * 500

  const streakMultiplier = 1 + maxStreak * 0.1

  return Math.round((accuracyScore + speedScore) * streakMultiplier)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/scoring.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/scoring.ts tests/unit/scoring.test.ts
git commit -m "feat: add scoring utility with accuracy, speed, and streak scoring"
```

---

### Task 5: useTimer Composable (TDD)

**Files:**

- Create: `app/composables/useTimer.ts`
- Test: `tests/unit/useTimer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/useTimer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with the given time limit', () => {
    const timer = useTimer()
    timer.init(60)
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
    expect(timer.isExpired.value).toBe(false)
  })

  it('counts down each second when started', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(57)
    expect(timer.isRunning.value).toBe(true)
  })

  it('stops at zero and marks as expired', () => {
    const timer = useTimer()
    timer.init(3)
    timer.start()

    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(0)
    expect(timer.isExpired.value).toBe(true)
    expect(timer.isRunning.value).toBe(false)
  })

  it('can be paused and resumed', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(2000)
    expect(timer.remaining.value).toBe(58)

    timer.pause()
    vi.advanceTimersByTime(5000)
    expect(timer.remaining.value).toBe(58)

    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.remaining.value).toBe(57)
  })

  it('resets to initial time', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(10000)
    expect(timer.remaining.value).toBe(50)

    timer.reset()
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
  })

  it('reports elapsed time', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(15000)
    expect(timer.elapsed.value).toBe(15)
  })

  it('calls onExpire callback when time runs out', () => {
    const onExpire = vi.fn()
    const timer = useTimer()
    timer.init(2, { onExpire })
    timer.start()

    vi.advanceTimersByTime(2000)
    expect(onExpire).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/unit/useTimer.test.ts
```

Expected: FAIL — `useTimer` is not defined.

- [ ] **Step 3: Write the implementation**

Create `app/composables/useTimer.ts`:

```typescript
interface TimerOptions {
  onExpire?: () => void
}

export function useTimer() {
  const remaining = ref(0)
  const isRunning = ref(false)
  const isExpired = ref(false)

  let initialTime = 0
  let intervalId: ReturnType<typeof setInterval> | null = null
  let onExpireCallback: (() => void) | undefined

  const elapsed = computed(() => initialTime - remaining.value)

  function init(seconds: number, options?: TimerOptions) {
    stop()
    initialTime = seconds
    remaining.value = seconds
    isRunning.value = false
    isExpired.value = false
    onExpireCallback = options?.onExpire
  }

  function start() {
    if (isRunning.value || isExpired.value) return

    isRunning.value = true
    intervalId = setInterval(() => {
      remaining.value--

      if (remaining.value <= 0) {
        remaining.value = 0
        stop()
        isExpired.value = true
        onExpireCallback?.()
      }
    }, 1000)
  }

  function pause() {
    stop()
  }

  function reset() {
    stop()
    remaining.value = initialTime
    isExpired.value = false
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  onUnmounted(() => {
    stop()
  })

  return {
    remaining: readonly(remaining),
    elapsed,
    isRunning: readonly(isRunning),
    isExpired: readonly(isExpired),
    init,
    start,
    pause,
    reset,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/useTimer.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTimer.ts tests/unit/useTimer.test.ts
git commit -m "feat: add useTimer composable with countdown, pause, and expiry"
```

---

### Task 6: useGame Composable (TDD)

**Files:**

- Create: `app/composables/useGame.ts`
- Test: `tests/unit/useGame.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/useGame.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
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

    const imageCard = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const textCard = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'text',
    )!

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

    const cardA = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const cardB = game.cards.value.find(
      (c) => c.pairId === 'b' && c.type === 'text',
    )!

    game.flipCard(cardA.id)
    game.flipCard(cardB.id)

    // Cards should be flipped while showing mismatch
    await nextTick()
    expect(game.cards.value.find((c) => c.id === cardA.id)!.isFlipped).toBe(
      true,
    )

    // After delay, cards flip back
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(game.cards.value.find((c) => c.id === cardA.id)!.isFlipped).toBe(
      false,
    )
    expect(game.cards.value.find((c) => c.id === cardB.id)!.isFlipped).toBe(
      false,
    )

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

    // Match pair 'a'
    const a1 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const a2 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'text',
    )!
    game.flipCard(a1.id)
    game.flipCard(a2.id)
    await nextTick()
    expect(game.streak.value).toBe(1)

    // Match pair 'b'
    const b1 = game.cards.value.find(
      (c) => c.pairId === 'b' && c.type === 'image',
    )!
    const b2 = game.cards.value.find(
      (c) => c.pairId === 'b' && c.type === 'text',
    )!
    game.flipCard(b1.id)
    game.flipCard(b2.id)
    await nextTick()
    expect(game.streak.value).toBe(2)
  })

  it('resets streak on mismatch', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    // Match pair 'a'
    const a1 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const a2 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'text',
    )!
    game.flipCard(a1.id)
    game.flipCard(a2.id)
    await nextTick()
    expect(game.streak.value).toBe(1)

    // Mismatch
    const c1 = game.cards.value.find(
      (c) => c.pairId === 'b' && c.type === 'image',
    )!
    const c2 = game.cards.value.find(
      (c) => c.pairId === 'c' && c.type === 'text',
    )!
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

    const a1 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const a2 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'text',
    )!
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
    game.flipCard(card.id) // same card again

    // Should still only have one flipped card, no move counted
    const flipped = game.cards.value.filter((c) => c.isFlipped)
    expect(flipped).toHaveLength(1)
    expect(game.moves.value).toBe(0)
  })

  it('blocks flipping during mismatch reveal', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    // Cause a mismatch
    const c1 = game.cards.value.find(
      (c) => c.pairId === 'a' && c.type === 'image',
    )!
    const c2 = game.cards.value.find(
      (c) => c.pairId === 'b' && c.type === 'text',
    )!
    game.flipCard(c1.id)
    game.flipCard(c2.id)
    await nextTick()

    // Try to flip another card during the mismatch delay
    const c3 = game.cards.value.find(
      (c) => c.pairId === 'c' && c.type === 'image',
    )!
    game.flipCard(c3.id)
    expect(game.cards.value.find((c) => c.id === c3.id)!.isFlipped).toBe(false)

    vi.advanceTimersByTime(1000)
    vi.useRealTimers()
  })

  it('marks game as complete when all pairs matched', async () => {
    const game = useGame()
    game.init(testPairs)

    for (const pairId of ['a', 'b', 'c', 'd']) {
      const img = game.cards.value.find(
        (c) => c.pairId === pairId && c.type === 'image',
      )!
      const txt = game.cards.value.find(
        (c) => c.pairId === pairId && c.type === 'text',
      )!
      game.flipCard(img.id)
      game.flipCard(txt.id)
      await nextTick()
    }

    expect(game.isComplete.value).toBe(true)
    expect(game.matchedPairs.value).toBe(4)
  })

  it('tracks maxStreak across the game', async () => {
    vi.useFakeTimers()

    const game = useGame()
    game.init(testPairs)

    // Match two in a row (streak = 2)
    for (const pairId of ['a', 'b']) {
      const img = game.cards.value.find(
        (c) => c.pairId === pairId && c.type === 'image',
      )!
      const txt = game.cards.value.find(
        (c) => c.pairId === pairId && c.type === 'text',
      )!
      game.flipCard(img.id)
      game.flipCard(txt.id)
      await nextTick()
    }
    expect(game.maxStreak.value).toBe(2)

    // Cause a mismatch (streak resets to 0, but maxStreak stays 2)
    const c1 = game.cards.value.find(
      (c) => c.pairId === 'c' && c.type === 'image',
    )!
    const c2 = game.cards.value.find(
      (c) => c.pairId === 'd' && c.type === 'text',
    )!
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/unit/useGame.test.ts
```

Expected: FAIL — `useGame` is not defined.

- [ ] **Step 3: Write the implementation**

Create `app/composables/useGame.ts`:

```typescript
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

  const isComplete = computed(
    () => matchedPairs.value === totalPairs.value && totalPairs.value > 0,
  )

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

    const card = cards.value.find((c) => c.id === cardId)
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
    const first = cards.value.find((c) => c.id === firstId)!
    const second = cards.value.find((c) => c.id === secondId)!

    if (first.pairId === second.pairId && first.type !== second.type) {
      // Match
      first.isMatched = true
      second.isMatched = true
      matchedPairs.value++
      streak.value++
      if (streak.value > maxStreak.value) {
        maxStreak.value = streak.value
      }
      flippedCards.length = 0
    } else {
      // Mismatch
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
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/useGame.test.ts
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useGame.ts tests/unit/useGame.test.ts
git commit -m "feat: add useGame composable with card flip, match, and streak logic"
```

---

### Task 7: GameCard Component

**Files:**

- Create: `app/components/game/GameCard.vue`
- Test: `tests/components/GameCard.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/GameCard.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameCard from '~/components/game/GameCard.vue'

describe('GameCard', () => {
  const baseProps = {
    card: {
      id: 'a-text',
      pairId: 'a',
      type: 'text' as const,
      content: 'Alpha',
      isFlipped: false,
      isMatched: false,
    },
  }

  it('renders face-down by default', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    expect(wrapper.find('[data-testid="card-back"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="card-front"]').exists()).toBe(true)
    expect(wrapper.classes()).not.toContain('is-flipped')
  })

  it('shows flipped state when isFlipped is true', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isFlipped: true },
      },
    })
    expect(wrapper.classes()).toContain('is-flipped')
  })

  it('shows matched state when isMatched is true', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isMatched: true, isFlipped: true },
      },
    })
    expect(wrapper.classes()).toContain('is-matched')
  })

  it('emits flip event on click', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    await wrapper.trigger('click')
    expect(wrapper.emitted('flip')).toHaveLength(1)
    expect(wrapper.emitted('flip')![0]).toEqual(['a-text'])
  })

  it('displays text content for text type cards', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isFlipped: true },
      },
    })
    expect(wrapper.find('[data-testid="card-front"]').text()).toContain('Alpha')
  })

  it('displays image for image type cards', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: {
          ...baseProps.card,
          type: 'image' as const,
          content: '/img/flags/ua.webp',
          isFlipped: true,
        },
      },
    })
    const img = wrapper.find('[data-testid="card-front"] img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/img/flags/ua.webp')
  })

  it('has correct aria-label', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    expect(wrapper.attributes('aria-label')).toContain('card')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/components/GameCard.test.ts
```

Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `app/components/game/GameCard.vue`:

```vue
<script setup lang="ts">
import type { GameCard } from '~/types'

const props = defineProps<{
  card: GameCard
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()

function handleClick() {
  emit('flip', props.card.id)
}

const ariaLabel = computed(() => {
  if (!props.card.isFlipped && !props.card.isMatched) {
    return 'Hidden card — click to reveal'
  }
  return props.card.type === 'text'
    ? `Card: ${props.card.content}`
    : 'Image card'
})
</script>

<template>
  <div
    class="game-card"
    :class="{
      'is-flipped': card.isFlipped || card.isMatched,
      'is-matched': card.isMatched,
    }"
    :aria-label="ariaLabel"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="game-card__inner">
      <div
        data-testid="card-back"
        class="game-card__face game-card__face--back"
      >
        <span class="text-2xl">?</span>
      </div>
      <div
        data-testid="card-front"
        class="game-card__face game-card__face--front"
      >
        <img
          v-if="card.type === 'image'"
          :src="card.content"
          :alt="card.pairId"
          class="h-full w-full rounded-[--radius-card] object-cover"
          loading="lazy"
        />
        <span v-else class="text-center text-lg font-semibold">
          {{ card.content }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  perspective: 600px;
  cursor: pointer;
  aspect-ratio: 3 / 4;
}

.game-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s var(--ease-flip);
  transform-style: preserve-3d;
}

.is-flipped .game-card__inner {
  transform: rotateY(180deg);
}

.is-matched .game-card__inner {
  animation: matchBounce 0.4s var(--ease-bounce);
}

.game-card__face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  border-radius: var(--radius-card);
  padding: 0.5rem;
}

.game-card__face--back {
  background-color: var(--color-primary-500);
  color: white;
}

.game-card__face--front {
  background-color: var(--color-surface-100);
  border: 2px solid var(--color-surface-200);
  transform: rotateY(180deg);
}

.is-matched .game-card__face--front {
  border-color: var(--color-success);
  box-shadow: 0 0 12px oklch(0.65 0.18 145 / 0.3);
}

@keyframes matchBounce {
  0%,
  100% {
    transform: rotateY(180deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-card__inner {
    transition: none;
  }
  .is-matched .game-card__inner {
    animation: none;
  }
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/components/GameCard.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/game/GameCard.vue tests/components/GameCard.test.ts
git commit -m "feat: add GameCard component with flip animation and a11y"
```

---

### Task 8: GameBoard Component

**Files:**

- Create: `app/components/game/GameBoard.vue`

- [ ] **Step 1: Create the component**

Create `app/components/game/GameBoard.vue`:

```vue
<script setup lang="ts">
import type { GameCard } from '~/types'

defineProps<{
  cards: readonly GameCard[]
  gridCols: number
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()
</script>

<template>
  <div
    class="grid gap-3"
    :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }"
    role="grid"
    aria-label="Game board"
  >
    <GameCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      @flip="emit('flip', $event)"
    />
  </div>
</template>
```

- [ ] **Step 2: Verify it renders with dev server**

Start the dev server (`pnpm dev`) and manually verify the component renders if needed. Formal testing of this thin wrapper is covered by the E2E tests in Plan 4.

- [ ] **Step 3: Commit**

```bash
git add app/components/game/GameBoard.vue
git commit -m "feat: add GameBoard grid component"
```

---

### Task 9: GameHud Component

**Files:**

- Create: `app/components/game/GameHud.vue`

- [ ] **Step 1: Create the component**

Create `app/components/game/GameHud.vue`:

```vue
<script setup lang="ts">
defineProps<{
  moves: number
  matchedPairs: number
  totalPairs: number
  streak: number
  timeRemaining: number
}>()
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 rounded-xl bg-surface-100 px-6 py-3"
  >
    <div class="flex items-center gap-6">
      <div class="text-center">
        <div class="text-sm text-surface-700">Moves</div>
        <div class="text-2xl font-bold">{{ moves }}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-surface-700">Matched</div>
        <div class="text-2xl font-bold">
          {{ matchedPairs }}/{{ totalPairs }}
        </div>
      </div>
      <div v-if="streak > 1" class="text-center">
        <div class="text-sm text-surface-700">Streak</div>
        <div class="text-2xl font-bold text-primary-500">{{ streak }}x</div>
      </div>
    </div>
    <div class="text-center">
      <div class="text-sm text-surface-700">Time</div>
      <div
        class="text-2xl font-bold tabular-nums"
        :class="{ 'text-danger': timeRemaining <= 10 }"
      >
        {{ Math.floor(timeRemaining / 60) }}:{{
          String(timeRemaining % 60).padStart(2, '0')
        }}
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/game/GameHud.vue
git commit -m "feat: add GameHud component with moves, matches, streak, and timer"
```

---

### Task 10: Default Layout

**Files:**

- Create: `app/layouts/default.vue`

- [ ] **Step 1: Create the layout**

Create `app/layouts/default.vue`:

```vue
<template>
  <div class="min-h-screen bg-surface-50 text-surface-900">
    <header class="border-b border-surface-200 px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600">
          Memojo
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat: add default layout with header and main content area"
```

---

### Task 11: Play Page

**Files:**

- Create: `app/pages/play/[slug].vue`

- [ ] **Step 1: Create the play page**

Create `app/pages/play/[slug].vue`:

```vue
<script setup lang="ts">
import type { TopicPack } from '~/types'
import { LEVELS } from '~/types'
import { calculateScore } from '~/utils/scoring'

const route = useRoute()
const slug = route.params.slug as string

const { data: topicPack, error } = await useFetch<TopicPack>(
  `/topics/${slug}.json`,
)

if (error.value || !topicPack.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Topic "${slug}" not found`,
  })
}

const level = LEVELS[0]
const selectedPairs = topicPack.value.pairs.slice(0, level.pairs)

const game = useGame()
const timer = useTimer()

const finalScore = ref<number | null>(null)

function startGame() {
  finalScore.value = null
  game.init(selectedPairs)
  timer.init(level.timeLimit, {
    onExpire: () => endGame(),
  })
  timer.start()
}

function endGame() {
  timer.pause()
  finalScore.value = calculateScore({
    moves: game.moves.value,
    totalPairs: game.totalPairs.value,
    timeElapsed: timer.elapsed.value,
    timeLimit: level.timeLimit,
    maxStreak: game.maxStreak.value,
  })
}

function handleFlip(cardId: string) {
  game.flipCard(cardId)
}

watch(
  () => game.isComplete.value,
  (complete) => {
    if (complete) endGame()
  },
)

useHead({
  title: `Play ${topicPack.value.name} — Memojo`,
})

startGame()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ topicPack!.name }}</h1>
      <button
        class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
        @click="startGame"
      >
        Restart
      </button>
    </div>

    <GameHud
      :moves="game.moves.value"
      :matched-pairs="game.matchedPairs.value"
      :total-pairs="game.totalPairs.value"
      :streak="game.streak.value"
      :time-remaining="timer.remaining.value"
    />

    <GameBoard
      :cards="game.cards.value"
      :grid-cols="level.gridCols"
      @flip="handleFlip"
    />

    <!-- Game Complete Overlay -->
    <div
      v-if="finalScore !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"
      >
        <h2 class="mb-2 text-3xl font-bold">
          {{ game.isComplete ? 'Well Done!' : "Time's Up!" }}
        </h2>
        <p class="mb-6 text-surface-700">
          {{
            game.isComplete
              ? 'You matched all pairs!'
              : 'Better luck next time.'
          }}
        </p>
        <div class="mb-6 space-y-2 text-lg">
          <div>
            Score:
            <span class="font-bold text-primary-600">{{ finalScore }}</span>
          </div>
          <div>
            Moves: <span class="font-bold">{{ game.moves.value }}</span>
          </div>
          <div>
            Best Streak:
            <span class="font-bold">{{ game.maxStreak.value }}x</span>
          </div>
          <div>
            Time: <span class="font-bold">{{ timer.elapsed.value }}s</span>
          </div>
        </div>
        <div class="flex gap-3 justify-center">
          <button
            class="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600"
            @click="startGame"
          >
            Play Again
          </button>
          <NuxtLink
            to="/"
            class="rounded-lg border border-surface-200 px-6 py-3 font-medium hover:bg-surface-100"
          >
            Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/play/world-flags`. Expected:

- HUD shows moves (0), matched (0/4), and countdown timer
- 8 cards displayed in a 4-column grid (face-down)
- Clicking a card flips it to reveal content
- Matching an image card with its text card highlights both
- Mismatched cards flip back after 1 second
- Completing all matches shows the results overlay with score

- [ ] **Step 3: Commit**

```bash
git add app/pages/play/
git commit -m "feat: add play page with game session, timer, scoring, and results"
```

---

### Task 12: Landing Page

**Files:**

- Create: `app/pages/index.vue`

- [ ] **Step 1: Create the landing page**

Create `app/pages/index.vue`:

```vue
<script setup lang="ts">
useHead({
  title: 'Memojo — Cross-Modal Memory Training',
})
</script>

<template>
  <div class="flex flex-col items-center gap-8 py-12 text-center">
    <h1 class="text-5xl font-bold tracking-tight">Memojo</h1>
    <p class="max-w-md text-lg text-surface-700">
      Match images to words. Train your memory with cross-modal matching across
      diverse topics.
    </p>

    <div class="flex flex-col gap-4">
      <NuxtLink
        to="/play/world-flags"
        class="rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-600 hover:shadow-xl"
      >
        Quick Play
      </NuxtLink>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000`. Expected:

- Title "Memojo"
- Description text
- "Quick Play" button that navigates to `/play/world-flags`

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: add landing page with quick play link"
```

---

### Task 13: Run Full Test Suite & Final Verification

- [ ] **Step 1: Run all tests**

```bash
pnpm vitest run
```

Expected: All tests pass (scoring: 6, useTimer: 7, useGame: 12, GameCard: 7 = 32 tests total).

- [ ] **Step 2: Run type check**

```bash
npx nuxi typecheck
```

Expected: No type errors.

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: Build succeeds without errors.

- [ ] **Step 4: Manual smoke test**

```bash
pnpm dev
```

Walk through the full flow:

1. Landing page loads at `/`
2. Click "Quick Play" → navigates to `/play/world-flags`
3. Cards render in 4-column grid
4. Timer counts down
5. Click cards to flip, match pairs, see streak
6. Complete all matches → results overlay shows score
7. "Play Again" restarts, "Home" returns to landing

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during final verification"
```

Only run this if fixes were needed. Skip if everything passed.

---

## What's Next

This plan produces a playable quick-play game with one topic. Subsequent plans build on this:

- **Plan 2:** Game modes (Daily Challenge with seeded random, Topic Practice with level progression), hint system (Peek, Eliminate), difficulty progression within sessions
- **Plan 3:** IndexedDB persistence, adaptive difficulty (performance tracking, SM-2 spaced repetition), personal best leaderboards, profile/stats page
- **Plan 4:** SSR landing/topic pages, dark/light theme toggle, full accessibility audit, CI/CD pipeline (GitHub Actions), production deployment config
