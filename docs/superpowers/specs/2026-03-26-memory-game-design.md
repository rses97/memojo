# Memojo — Design Spec

**Project name:** Memojo
**Repository:** `memojo` | **Domain:** `memojo.app` | **Browser tab:** `Memojo`

## Overview

A cross-modal memory game web application that combines visual↔text matching with adaptive difficulty and spaced repetition. Challenge-mode focused with daily challenges, topic practice, and quick play. Targets young adults and adults who want both entertainment and genuine cognitive training.

## Core Game Mechanics

### Cross-Modal Matching

Players match image↔text pairs on a card grid (not identical card pairs). Each topic pack contains image/text pairs (e.g., flag image ↔ country name).

### Game Modes

- **Daily Challenge** — fresh set of cards each day, deterministic based on date (seeded random using date as seed, no backend needed), same for all players, enables fair leaderboard comparison
- **Topic Practice** — pick a topic, play through progressive levels
- **Quick Play** — random topic, no progression, casual practice

### Difficulty Progression (within a session)

- Level 1: 4 pairs (2×4 grid), generous time
- Level 2: 6 pairs (3×4 grid), less time
- Level 3: 9 pairs (3×6 grid), time pressure + cards briefly shown then hidden
- Higher levels: larger grids, mixed topics, decoy cards (cards with no match)

### Scoring

Based on accuracy (fewer mismatches = higher score), speed, and streak multiplier.

### Hint System (earned, not free)

- **Peek** — briefly reveal all cards for 1 second (costs points)
- **Eliminate** — remove one wrong pair from the grid (costs points)
- Hints recharge between sessions, not buyable — keeps leaderboards fair

## Adaptive Difficulty System

### Performance Tracking (IndexedDB)

- Accuracy rate per topic and per pair
- Average time to match
- Streak length history

### Adaptation Rules

- Accuracy > 85% for 3 consecutive sessions → increase grid size or reduce time
- Accuracy < 60% → reduce grid size, add hints (brief card preview at start)
- Mixed-difficulty sessions: strong pairs appear less, weak pairs resurfaced more

### Spaced Repetition

Simplified SM-2 algorithm. Pairs the player got wrong are tracked and resurfaced in future sessions at optimal intervals, adapting per-user.

## Content

### Pre-built Topic Packs (shipped with app)

- World Flags (flag image ↔ country name)
- Solar System (planet/object image ↔ name + fact)
- Animals (photo ↔ species name)
- Human Body (organ/system diagram ↔ name)
- World Landmarks (photo ↔ name + location)

Each pack contains 30–50 pairs.

### Content Structure

```json
{
  "topic": "world-flags",
  "pairs": [
    {
      "id": "ua",
      "image": "/img/flags/ua.webp",
      "text": "Ukraine",
      "hint": "Eastern Europe"
    }
  ]
}
```

Static JSON files per topic, loaded on demand. JSON-based format enables future extensibility (user-generated content out of scope for v1).

### SEO

Each topic gets its own SSR-rendered landing page (`/topics/world-flags`) with description, difficulty rating, and preview.

## Leaderboards

Personal bests only (no backend in v1). Stored in IndexedDB alongside all other user data. Per-topic and overall rankings. Daily challenge personal history.

## Tech Stack

- **Framework:** Nuxt 4 with SSR for landing/topic pages, client-side for gameplay
- **Language:** TypeScript (strict mode, all files)
- **Styling:** Tailwind CSS v4 with custom `@theme` tokens (no prefix)
- **State Management:** Pinia for runtime state
- **Persistence:** IndexedDB for all client-side data (via composable)
- **Deployment:** Vercel
- **No backend in v1**
- **No Reka UI in v1**

### Custom Tailwind Theme (CSS-first, v4)

<!-- prettier-ignore -->
```css
@theme {
  --color-primary-*: /* game accents, buttons */
  --color-surface-*: /* card backgrounds */
  --radius-card: /* card corners */
  --ease-flip: /* card flip animation */
  --ease-bounce: /* match celebration */
}
```

Dark/light theming via Tailwind's `dark:` variant.

## Testing

- **Vitest** — unit tests for game logic, spaced repetition algorithm, scoring, composables
- **@vue/test-utils** — component tests with Vitest as runner
- **Playwright** — E2E tests (full game session, daily challenge flow, leaderboard)

## CI/CD (GitHub Actions)

### On PR:

- Lint (ESLint + Prettier check)
- Type check (`nuxi typecheck`)
- Unit & component tests (Vitest)
- E2E tests (Playwright)
- Build check (`nuxi build`)

### On merge to main:

- Same checks as PR
- Build production bundle
- Deploy to Vercel

## Accessibility & Performance

### Accessibility

- Semantic HTML, ARIA labels on cards
- Keyboard navigation for card grid (arrow keys + Enter to flip)
- Focus management
- Sufficient color contrast in both themes
- `prefers-reduced-motion` support to disable flip animations

### Performance

- Lazy-load topic images
- WebP format for images
- Minimal dependencies
- Nuxt SSR for fast initial load on landing pages
- Client-side hydration for gameplay
- `requestAnimationFrame` for timer/animations

## Project Architecture

Nuxt-native structure with domain grouping:

```
app/
├── assets/css/main.css              # @theme tokens, global styles
├── components/
│   ├── game/                        # GameBoard, GameCard, GameTimer, GameHud
│   ├── topic/                       # TopicSelector, TopicCard
│   ├── leaderboard/                 # LeaderboardTable
│   └── ui/                          # ThemeToggle
├── composables/
│   ├── useGame.ts                   # game logic (flip, match, score)
│   ├── useSpacedRepetition.ts       # SM-2 algorithm
│   ├── useAdaptive.ts               # difficulty adjustment
│   ├── useIndexedDB.ts              # persistence layer
│   └── useTimer.ts                  # countdown logic
├── content/topics/                  # static JSON topic packs
├── layouts/default.vue
├── pages/
│   ├── index.vue                    # landing (SSR)
│   ├── topics/index.vue             # topic listing (SSR)
│   ├── topics/[slug].vue            # topic detail (SSR)
│   ├── play/[slug].vue              # game screen (client-side)
│   ├── daily.vue                    # daily challenge
│   ├── leaderboard.vue              # personal bests
│   └── profile.vue                  # stats & settings
├── stores/
│   ├── game.ts                      # Pinia: runtime game state
│   └── user.ts                      # Pinia: user prefs, theme
├── types/index.ts                   # shared TypeScript types
└── utils/scoring.ts                 # scoring calculations
tests/
├── unit/                            # Vitest
├── components/                      # @vue/test-utils
└── e2e/                             # Playwright
```

### Architectural Principles

- Composables own business logic — components are thin, rendering only
- Pinia for runtime state, IndexedDB for persistence
- Content as static JSON, loaded on demand
- SSR for SEO pages, client-side for gameplay
- Domain grouping within Nuxt conventions (not strict FSD)

## Design Style

Modern, balanced between minimal and playful. Clean whitespace with satisfying game animations (card flip, match glow, streak effects). Dark/light theme toggle.

## Target Audience

Young adults and adults (13+). Sophisticated mechanics, clean design, cognitive training appeal.

## Out of Scope (v1)

- Backend / API server
- Real-time multiplayer
- User-generated content
- Global leaderboards (requires backend)
- Reka UI
- Docker
