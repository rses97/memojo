# Game Result Modals

**Date:** 2026-04-06  
**Status:** Approved

## Problem

Completion UIs are inconsistent across the app:

- `daily.vue` shows an inline block below the board
- `play/[slug].vue` has a centered fixed modal with a dark backdrop
- `topics/[slug].vue` shows inline blocks for both per-level and all-levels-complete states

The goal is a consistent, celebratory full-screen takeover for all game completion states.

## Decision

Two components handle all completion states:

1. **`GameResultModal.vue`** — final game-over (all-complete or time's up)
2. **`GameLevelComplete.vue`** — restyled between-levels interstitial (existing API preserved)

Both use a full-screen fixed overlay with the same Fade+Pop spring animation.

---

## Components

### `GameResultModal.vue`

**Purpose:** Final game-over screen for daily challenge, quick play, and topic practice all-levels-complete.

**Props:**

```ts
title: string // e.g. "Challenge Complete!" or "Time's Up!"
emoji: string // e.g. "🎉" or "⏰"
score: number
stats: string // e.g. "5 / 5 pairs matched in 12 moves"
```

**Slot:** `actions` — caller provides buttons/links (Play Again, Back to Menu, etc.)

**Visual:**

- `position: fixed; inset: 0; z-index: 50`
- Background: `linear-gradient(135deg, #1e1e3f, #2d1b69)` (deep indigo)
- Content centered with emoji, title (indigo), score, stats, then action buttons

**Animation (`fadeScale`):**

```css
@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

@media (prefers-reduced-motion: reduce) {
  animation: fadeIn 0.3s ease both; /* opacity only */
}
```

---

### `GameLevelComplete.vue` (restyled)

**Purpose:** Between-levels interstitial in topic practice. Visually distinct from the final screen.

**Props/emits:** Unchanged from current implementation:

```ts
props: {
  ;(levelIndex, totalLevels, score, isLastLevel)
}
emits: ['next']
```

**Visual:**

- Same fixed overlay + Fade+Pop animation
- Background: `linear-gradient(160deg, #1a2035, #1e2d4a)` (blue tinted)
- "Level X of Y" badge (blue pill)
- Progress pips (one per level, filled = completed)
- Button: "Next Level →" or "View Results" when `isLastLevel`

---

## Pages Updated

| Page                | Change                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `daily.vue`         | Replace inline `v-if="isGameOver"` block with `<GameResultModal>`                                                 |
| `play/[slug].vue`   | Replace existing fixed modal div with `<GameResultModal>`                                                         |
| `topics/[slug].vue` | Replace inline "All Levels Complete" block with `<GameResultModal>`; `<GameLevelComplete>` gets restyled in-place |

### Action buttons per page

**`daily.vue`:**

- "Back to Menu" → `/`

**`play/[slug].vue`:**

- "Play Again" (calls `startGame()`)
- "Home" → `/`

**`topics/[slug].vue` all-levels-complete:**

- "Play Again" (calls `handleRestart()`)
- "Other Topics" → `/topics`

---

## Accessibility & Motion

- `prefers-reduced-motion: reduce` → animation falls back to a simple `fadeIn` (no scale)
- Both components use semantic `<h2>` for the title
- Action buttons remain keyboard-focusable

---

## Out of Scope

- Confetti or particle effects
- Score sharing / copy-to-clipboard
- Leaderboard integration from the modal
