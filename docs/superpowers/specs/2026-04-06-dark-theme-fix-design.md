# Dark Theme Fix — Design Spec

**Date:** 2026-04-06  
**Approach:** Option A — Complete Fix

## Problem

The dark theme is broken or inconsistent in multiple places:

1. Root page background stays near-white in dark mode (`surface-50` = oklch 0.93)
2. Header background too light in dark mode (`dark:bg-surface-100` = oklch 0.78)
3. Play page results modal is hard-coded `bg-white` with no dark variant
4. Four surface token stops are missing (300, 400, 500, 600) — elements using them get transparent/invisible text
5. Leaderboard and profile pages use raw Tailwind `gray-*` classes instead of `surface-*` tokens
6. `pages/index.vue` mixes raw `gray-*` and undefined `surface-600`
7. `GameHud` has no dark background variant
8. `GameCard` front face uses `var(--color-surface-100)` which is light (oklch 0.78) in dark mode

## Solution

### 1. Add missing surface token stops (`app/assets/css/main.css`)

Extend the `@theme` block and the `.dark` override with stops 300–600:

| Stop          | Light oklch L | Dark oklch L |
| ------------- | ------------- | ------------ |
| `surface-300` | 0.83          | 0.55         |
| `surface-400` | 0.76          | 0.45         |
| `surface-500` | 0.68          | 0.38         |
| `surface-600` | 0.55          | 0.32         |

Chroma and hue stay consistent with the existing scale (chroma ~0.01–0.03, hue 260).

### 2. Fix per file

| File                               | Change                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layouts/default.vue`          | Root div: add `dark:bg-surface-900`. Header: change `dark:bg-surface-100` → `dark:bg-surface-800`. Footer text: `text-surface-500` stays (now defined).                                                                                                                                                                                 |
| `app/components/game/GameHud.vue`  | Add `dark:bg-surface-800` to wrapper. Label text `text-surface-700` → add `dark:text-surface-300`.                                                                                                                                                                                                                                      |
| `app/components/game/GameCard.vue` | Add `.dark .game-card__face--front` CSS rule: `background-color: var(--color-surface-800); border-color: var(--color-surface-700)`.                                                                                                                                                                                                     |
| `app/pages/play/[slug].vue`        | Modal: `bg-white` → `bg-white dark:bg-surface-800`. Add `dark:text-surface-50` on heading, `dark:text-surface-300` on body text.                                                                                                                                                                                                        |
| `app/pages/daily.vue`              | `text-surface-500` → `text-surface-700 dark:text-surface-300`. Game-over card text already uses defined stops.                                                                                                                                                                                                                          |
| `app/pages/topics/[slug].vue`      | Fix `text-surface-500` → `text-surface-700 dark:text-surface-300`. Fix `hover:bg-surface-300 dark:hover:bg-surface-600` (now defined).                                                                                                                                                                                                  |
| `app/pages/leaderboard.vue`        | Replace all `bg-gray-100` → `bg-surface-100 dark:bg-surface-800`, `border-gray-200/700` → `border-surface-200 dark:border-surface-700`, `text-gray-500/400` → `text-surface-500 dark:text-surface-400`, `dark:bg-gray-800` → `dark:bg-surface-800`. Selects: `bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700`. |
| `app/pages/profile.vue`            | Same `gray-*` → `surface-*` replacements as leaderboard.                                                                                                                                                                                                                                                                                |
| `app/pages/index.vue`              | `text-surface-600` → `text-surface-700 dark:text-surface-300`. Replace `border-gray-300 dark:border-gray-600 dark:hover:bg-gray-800` → `border-surface-200 dark:border-surface-700 dark:hover:bg-surface-800`.                                                                                                                          |

## Out of Scope

- No semantic token layer (deferred — overkill for current scope)
- No changes to primary-\* color scale
- No changes to success/danger tokens
- No new components
