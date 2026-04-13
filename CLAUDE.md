# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # dev server at http://localhost:3000
pnpm build            # production build
pnpm test             # Vitest watch mode
pnpm test:run         # run all tests once
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix

# Run a single test file
pnpm vitest run tests/unit/useGame.test.ts
```

Commits must follow Conventional Commits (enforced by commitlint + husky). Lint-staged runs ESLint + Prettier on staged files automatically.

## Architecture

**Nuxt 4** with `future.compatibilityVersion: 4` — source lives under `app/` (not `src/`). Auto-imports are active for composables, components, and Vue APIs (`ref`, `computed`, `watch`, etc.).

**Tailwind CSS v4** — configured CSS-first in `app/assets/css/main.css` via `@theme {}`. No `tailwind.config.ts`. Custom tokens: `primary-*` (indigo oklch scale), `surface-*` (neutral scale), `success`, `danger`, `--radius-card`, `--ease-flip`, `--ease-bounce`.

**Types** (`app/types/index.ts`) are the source of truth for data shapes: `TopicPair`, `TopicPack`, `GameCard` (includes `isEliminated`), `GameLevel`, `GameResult`, `HintState`, `GameMode`, and the `LEVELS` constant (3 difficulty levels driving pairs count, grid cols, time limit, and optional preview time). `HINT_COSTS` and `INITIAL_HINTS` are also exported constants.

**Topic packs** are static JSON files served from `public/topics/{slug}.json`. Images are SVGs under `public/img/{category}/`. Topic manifest at `public/topics/manifest.json`. No backend — all game data is client-side static.

**Core composables:**

- `useGame` — card state machine. `init(pairs, seed?)` accepts an optional seed for deterministic shuffles. Returns `flipCard`, `reset`, `peekAll`, `eliminatePair`, and state including `hints` (HintState ref), `isPeeking`, `isProcessing`, `matchedPairs`, `totalPairs`, `isComplete`. Direct property mutation on card objects is intentional — `readonly()` only blocks ref reassignment.
- `useTimer` — countdown timer using `performance.now()` sampled every 250ms. Accepts an injectable `clock` function for testing. Pauses automatically on `visibilitychange`. Use `init(seconds, { onExpire })` then `start()`.
- `useTopicPractice` — level progression wrapper for topic practice. Manages `currentLevelIndex`, `selectedPairs`, `totalScore`, `showLevelComplete`. Call `completeLevelAndShow(score)` when a level ends, `advanceLevel()` to move forward.

**Scoring** (`app/utils/scoring.ts`) is a pure function: accuracy, speed ratio, streak multiplier, minus hint penalties (`HINT_COSTS.peek = 200`, `HINT_COSTS.eliminate = 300`). Accepts optional `hintsUsed: { peek, eliminate }`.

**Seeded random** (`app/utils/seededRandom.ts`): `dateSeed(date)` uses UTC getters for cross-timezone consistency. `seededShuffle(array, seed)` uses mulberry32 PRNG.

**Tests** use Vitest with `environment: 'nuxt'` (happy-dom). Unit tests live in `tests/unit/`, component tests in `tests/components/`. `useTimer` tests inject a manual clock instead of using `vi.useFakeTimers()` to avoid `performance.now()` conflicts.

**GameCard** uses CSS 3D perspective flip (`.game-card__inner` with `transform-style: preserve-3d`). Match state triggers a bounce keyframe animation. Respects `prefers-reduced-motion`.
