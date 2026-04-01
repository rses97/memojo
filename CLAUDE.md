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

**Types** (`app/types/index.ts`) are the source of truth for data shapes: `TopicPair`, `TopicPack`, `GameCard`, `GameLevel`, `GameResult`, and the `LEVELS` constant (3 difficulty levels driving pairs count, grid cols, time limit, and optional preview time).

**Topic packs** are static JSON files served from `public/topics/{slug}.json`. Images are SVGs under `public/img/{category}/`. No backend — all game data is client-side static.

**Core composables:**

- `useGame` — card state machine. Cards are created in `init(pairs)`, shuffled, and stored as `readonly(cards)`. Direct property mutation on card objects (e.g. `card.isFlipped = true`) is intentional — `readonly()` only blocks ref reassignment. Returns `flipCard`, `reset`, and derived state (`matchedPairs`, `totalPairs`, `isComplete`, `isProcessing`).
- `useTimer` — countdown timer using `performance.now()` sampled every 250ms. Accepts an injectable `clock` function for testing. Pauses automatically on `visibilitychange` (tab hide). Use `init(seconds, { onExpire })` then `start()`.

**Scoring** (`app/utils/scoring.ts`) is a pure function: accuracy (moves vs perfect), speed ratio, and streak multiplier combined and rounded.

**Tests** use Vitest with `environment: 'nuxt'` (happy-dom). Unit tests live in `tests/unit/`, component tests in `tests/components/`. `useTimer` tests inject a manual clock instead of using `vi.useFakeTimers()` to avoid `performance.now()` conflicts.

**GameCard** uses CSS 3D perspective flip (`.game-card__inner` with `transform-style: preserve-3d`). Match state triggers a bounce keyframe animation. Respects `prefers-reduced-motion`.
