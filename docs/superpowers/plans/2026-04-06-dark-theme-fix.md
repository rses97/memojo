# Dark Theme Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all dark-mode visual breakages across the Memojo app by adding 4 missing surface token stops and replacing incorrect/undefined color classes in 9 files.

**Architecture:** Tailwind CSS v4 CSS-first config (`app/assets/css/main.css`) defines `@theme` tokens and a `.dark` override block. Adding the missing stops (300–600) to both blocks makes them available app-wide. Then each affected component/page is updated to use correct tokens and dark variants. No logic changes — template/CSS only.

**Tech Stack:** Nuxt 4, Tailwind CSS v4 (CSS-first, `@theme {}`), Vue SFC, oklch color space.

---

## Files Modified

| File                               | Change                                                        |
| ---------------------------------- | ------------------------------------------------------------- |
| `app/assets/css/main.css`          | Add `surface-300/400/500/600` to `@theme` and `.dark` blocks  |
| `app/layouts/default.vue`          | Root `dark:bg-surface-900`; header `dark:bg-surface-800`      |
| `app/components/game/GameHud.vue`  | `dark:bg-surface-800` wrapper; `dark:text-surface-300` labels |
| `app/components/game/GameCard.vue` | `.dark .game-card__face--front` CSS rule                      |
| `app/pages/play/[slug].vue`        | Modal `dark:bg-surface-800` + dark text                       |
| `app/pages/daily.vue`              | `text-surface-500` → `text-surface-700 dark:text-surface-300` |
| `app/pages/topics/[slug].vue`      | Same `text-surface-500` fix                                   |
| `app/pages/leaderboard.vue`        | All `gray-*` → `surface-*`                                    |
| `app/pages/profile.vue`            | All `gray-*` → `surface-*`                                    |
| `app/pages/index.vue`              | `text-surface-600` fix + gray border/hover classes            |

---

## Task 1: Add missing surface token stops to main.css

**Files:**

- Modify: `app/assets/css/main.css`

- [ ] **Step 1: Add stops 300–600 to the `@theme` block**

  In `app/assets/css/main.css`, the `@theme` surface section currently ends at `--color-surface-200` then jumps to `--color-surface-700`. Insert four new lines between them:

  Find:

  ```css
  --color-surface-200: oklch(0.9 0.015 260);
  --color-surface-700: oklch(0.35 0.03 260);
  ```

  Replace with:

  ```css
  --color-surface-200: oklch(0.9 0.015 260);
  --color-surface-300: oklch(0.83 0.02 260);
  --color-surface-400: oklch(0.76 0.02 260);
  --color-surface-500: oklch(0.68 0.025 260);
  --color-surface-600: oklch(0.55 0.025 260);
  --color-surface-700: oklch(0.35 0.03 260);
  ```

- [ ] **Step 2: Add dark overrides for stops 300–600 to the `.dark` block**

  In the same file, the `.dark` override block has `--color-surface-200` then jumps to `--color-surface-700`. Insert four new lines:

  Find:

  ```css
  --color-surface-200: oklch(0.65 0.02 260);
  --color-surface-700: oklch(0.27 0.02 260);
  ```

  Replace with:

  ```css
  --color-surface-200: oklch(0.65 0.02 260);
  --color-surface-300: oklch(0.55 0.02 260);
  --color-surface-400: oklch(0.45 0.02 260);
  --color-surface-500: oklch(0.38 0.02 260);
  --color-surface-600: oklch(0.32 0.02 260);
  --color-surface-700: oklch(0.27 0.02 260);
  ```

- [ ] **Step 3: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add app/assets/css/main.css
  git commit -m "fix(theme): add missing surface token stops 300-600"
  ```

---

## Task 2: Fix default.vue layout backgrounds

**Files:**

- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Add dark page background to root div (line 10)**

  Find:

  ```html
  <div class="min-h-screen bg-surface-50 text-surface-900"></div>
  ```

  Replace with:

  ```html
  <div class="min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-900"></div>
  ```

- [ ] **Step 2: Fix header dark background (line 13)**

  `dark:bg-surface-100` resolves to oklch(0.78) in dark mode — still light. Change to `dark:bg-surface-800`.

  Find:

  ```html
  <header class="border-b border-surface-200 bg-white dark:bg-surface-100"></header>
  ```

  Replace with:

  ```html
  <header class="border-b border-surface-200 bg-white dark:bg-surface-800"></header>
  ```

- [ ] **Step 3: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add app/layouts/default.vue
  git commit -m "fix(theme): fix dark page and header backgrounds in default layout"
  ```

---

## Task 3: Fix GameHud dark mode styling

**Files:**

- Modify: `app/components/game/GameHud.vue`

- [ ] **Step 1: Add dark background to the HUD wrapper (line 14)**

  `bg-surface-100` resolves to oklch(0.78) in dark mode — too light for the HUD bar.

  Find:

  ```html
  <div class="flex items-center justify-between gap-4 rounded-xl bg-surface-100 px-6 py-3"></div>
  ```

  Replace with:

  ```html
  <div
    class="flex items-center justify-between gap-4 rounded-xl bg-surface-100 dark:bg-surface-800 px-6 py-3"
  ></div>
  ```

- [ ] **Step 2: Add dark text variant to all label divs**

  There are four `text-surface-700` label divs (Moves, Matched, Streak, Time). Replace all four at once using the exact string that matches all of them:

  Find (line 17):

  ```html
  <div class="text-sm text-surface-700">Moves</div>
  ```

  Replace with:

  ```html
  <div class="text-sm text-surface-700 dark:text-surface-300">Moves</div>
  ```

  Find (line 21):

  ```html
  <div class="text-sm text-surface-700">Matched</div>
  ```

  Replace with:

  ```html
  <div class="text-sm text-surface-700 dark:text-surface-300">Matched</div>
  ```

  Find (line 26):

  ```html
  <div class="text-sm text-surface-700">Streak</div>
  ```

  Replace with:

  ```html
  <div class="text-sm text-surface-700 dark:text-surface-300">Streak</div>
  ```

  Find (line 30):

  ```html
  <div class="text-sm text-surface-700">Time</div>
  ```

  Replace with:

  ```html
  <div class="text-sm text-surface-700 dark:text-surface-300">Time</div>
  ```

- [ ] **Step 3: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add app/components/game/GameHud.vue
  git commit -m "fix(theme): fix GameHud dark background and label text colors"
  ```

---

## Task 4: Fix GameCard front face dark background

**Files:**

- Modify: `app/components/game/GameCard.vue`

- [ ] **Step 1: Add dark CSS rule for card front face**

  The `.game-card__face--front` rule uses `var(--color-surface-100)` which resolves to oklch(0.78) in dark mode — washed-out light card face. Add a `.dark` scoped override immediately after the existing `.game-card__face--front` block.

  Find:

  ```css
  .game-card__face--front {
    background-color: var(--color-surface-100);
    border: 2px solid var(--color-surface-200);
    transform: rotateY(180deg);
  }
  ```

  Replace with:

  ```css
  .game-card__face--front {
    background-color: var(--color-surface-100);
    border: 2px solid var(--color-surface-200);
    transform: rotateY(180deg);
  }

  :global(.dark) .game-card__face--front {
    background-color: var(--color-surface-800);
    border-color: var(--color-surface-700);
  }
  ```

  > Note: This file uses `<style scoped>`. In scoped styles, `.dark .game-card__face--front` would not work because the `.dark` class is on `<html>` (outside the component's scope). Use `:global(.dark)` so the selector escapes the scoped boundary while still applying to the component's front face element.

- [ ] **Step 2: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 3: Commit**

  ```bash
  git add app/components/game/GameCard.vue
  git commit -m "fix(theme): fix GameCard front face dark background"
  ```

---

## Task 5: Fix play/[slug].vue results modal

**Files:**

- Modify: `app/pages/play/[slug].vue`

- [ ] **Step 1: Add dark background to the modal container**

  The modal inner div is hard-coded `bg-white` with no dark variant.

  Find:

  ```html
  <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"></div>
  ```

  Replace with:

  ```html
  <div
    class="mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-surface-800 p-8 text-center shadow-xl"
  ></div>
  ```

- [ ] **Step 2: Add dark text to modal heading**

  Find:

  ```html
  <h2 class="mb-2 text-3xl font-bold"></h2>
  ```

  Replace with:

  ```html
  <h2 class="mb-2 text-3xl font-bold dark:text-surface-50"></h2>
  ```

- [ ] **Step 3: Add dark text to modal body paragraph**

  Find:

  ```html
  <p class="mb-6 text-surface-700"></p>
  ```

  Replace with:

  ```html
  <p class="mb-6 text-surface-700 dark:text-surface-300"></p>
  ```

- [ ] **Step 4: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 5: Commit**

  ```bash
  git add app/pages/play/[slug].vue
  git commit -m "fix(theme): fix play page results modal dark mode colors"
  ```

---

## Task 6: Fix daily.vue text color tokens

**Files:**

- Modify: `app/pages/daily.vue`

- [ ] **Step 1: Fix the date subtitle (line 108)**

  `text-surface-500 dark:text-surface-400` — both were undefined before Task 1. Now defined, but surface-500 dark = oklch(0.38) — too dark on dark bg. Change to proper readable values.

  Find:

  ```html
  <p class="text-sm text-surface-500 dark:text-surface-400"></p>
  ```

  Replace with:

  ```html
  <p class="text-sm text-surface-700 dark:text-surface-300"></p>
  ```

- [ ] **Step 2: Fix loading/error state text (lines 113, 116)**

  Find:

  ```html
  <div v-if="isLoading" class="py-20 text-center text-surface-500"></div>
  ```

  Replace with:

  ```html
  <div v-if="isLoading" class="py-20 text-center text-surface-700 dark:text-surface-300"></div>
  ```

  Find:

  ```html
  <div v-else-if="isError" class="py-20 text-center text-surface-500"></div>
  ```

  Replace with:

  ```html
  <div v-else-if="isError" class="py-20 text-center text-surface-700 dark:text-surface-300"></div>
  ```

- [ ] **Step 3: Fix game-over card stats text (line 156)**

  Find:

  ```html
  <p class="text-sm text-surface-500"></p>
  ```

  Replace with:

  ```html
  <p class="text-sm text-surface-700 dark:text-surface-300"></p>
  ```

- [ ] **Step 4: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 5: Commit**

  ```bash
  git add app/pages/daily.vue
  git commit -m "fix(theme): fix daily page undefined surface token usages"
  ```

---

## Task 7: Fix topics/[slug].vue text color tokens

**Files:**

- Modify: `app/pages/topics/[slug].vue`

- [ ] **Step 1: Fix loading placeholder text (line 174)**

  Find:

  ```html
  <div v-if="!isInitialized" class="py-20 text-center text-surface-500">Loading...</div>
  ```

  Replace with:

  ```html
  <div v-if="!isInitialized" class="py-20 text-center text-surface-700 dark:text-surface-300">
    Loading...
  </div>
  ```

- [ ] **Step 2: Fix all-complete card subtitle (line 183)**

  Find:

  ```html
  <p class="mb-6 text-sm text-surface-500"></p>
  ```

  Replace with:

  ```html
  <p class="mb-6 text-sm text-surface-700 dark:text-surface-300"></p>
  ```

- [ ] **Step 3: Fix level counter text (line 214)**

  `text-surface-500 dark:text-surface-400` — surface-500 and surface-400 were undefined. Replace with readable values.

  Find:

  ```html
  <div class="mb-4 text-center text-sm font-medium text-surface-500 dark:text-surface-400"></div>
  ```

  Replace with:

  ```html
  <div class="mb-4 text-center text-sm font-medium text-surface-700 dark:text-surface-300"></div>
  ```

- [ ] **Step 4: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 5: Commit**

  ```bash
  git add app/pages/topics/[slug].vue
  git commit -m "fix(theme): fix topics page undefined surface token usages"
  ```

---

## Task 8: Fix leaderboard.vue — replace raw gray-_ with surface-_ tokens

**Files:**

- Modify: `app/pages/leaderboard.vue`

- [ ] **Step 1: Fix the two filter selects (lines 77–94)**

  Both `<select>` elements use raw gray Tailwind classes. Replace both.

  Find (first select):

  ```html
  class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg border border-surface-200 bg-white px-4 py-2 dark:border-surface-700
  dark:bg-surface-800"
  ```

  Find (second select — identical classes):

  ```html
  class="rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg border border-surface-200 bg-white px-4 py-2 dark:border-surface-700
  dark:bg-surface-800"
  ```

  > If both selects share the exact same class string, use replace_all to update both at once.

- [ ] **Step 2: Fix empty-state divs (three occurrences)**

  All three empty-state blocks (`personalBests`, `filteredResults`, `dailyHistory`) use `bg-gray-100 text-gray-500 dark:bg-gray-800`. Replace all three.

  Find (first, line 103):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

  Find (second, line 150):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

  Find (third, line 200):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

- [ ] **Step 3: Fix table head borders in both tables**

  There are two `<thead>` elements with `border-gray-200 text-gray-500 dark:border-gray-700`.

  Find (first thead, line 111):

  ```html
  class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
  ```

  Replace with:

  ```html
  class="border-b border-surface-200 text-xs uppercase text-surface-500 dark:text-surface-400
  dark:border-surface-700"
  ```

  Find (second thead, line 159):

  ```html
  class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
  ```

  Replace with:

  ```html
  class="border-b border-surface-200 text-xs uppercase text-surface-500 dark:text-surface-400
  dark:border-surface-700"
  ```

- [ ] **Step 4: Fix table row borders in both tables**

  There are two sets of `<tr>` elements with `border-gray-100 dark:border-gray-800`.

  Find (rows in personalBests table, line 127):

  ```html
  class="border-b border-gray-100 dark:border-gray-800"
  ```

  Replace with:

  ```html
  class="border-b border-surface-100 dark:border-surface-800"
  ```

  Find (rows in filteredResults table, line 172):

  ```html
  class="border-b border-gray-100 dark:border-gray-800"
  ```

  Replace with:

  ```html
  class="border-b border-surface-100 dark:border-surface-800"
  ```

- [ ] **Step 5: Fix daily history card borders and text**

  Find (card wrapper, line 202):

  ```html
  class="flex items-center justify-between rounded-lg border border-gray-200 p-4
  dark:border-gray-700"
  ```

  Replace with:

  ```html
  class="flex items-center justify-between rounded-lg border border-surface-200 p-4
  dark:border-surface-700"
  ```

  Find (first stats text, line 206):

  ```html
  <p class="text-sm text-gray-500"></p>
  ```

  Replace with:

  ```html
  <p class="text-sm text-surface-500 dark:text-surface-400"></p>
  ```

  Find (second stats text, line 213):

  ```html
  <p class="text-sm text-gray-500">{{ Math.round(result.accuracy * 100) }}% accuracy</p>
  ```

  Replace with:

  ```html
  <p class="text-sm text-surface-500 dark:text-surface-400">
    {{ Math.round(result.accuracy * 100) }}% accuracy
  </p>
  ```

- [ ] **Step 6: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 7: Commit**

  ```bash
  git add app/pages/leaderboard.vue
  git commit -m "fix(theme): replace raw gray-* classes with surface-* tokens in leaderboard"
  ```

---

## Task 9: Fix profile.vue — replace raw gray-_ with surface-_ tokens

**Files:**

- Modify: `app/pages/profile.vue`

- [ ] **Step 1: Fix empty-state divs (four occurrences)**

  All four empty-state blocks use `bg-gray-100 text-gray-500 dark:bg-gray-800`.

  Find (Overall empty, line 131):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

  Find (Topics empty, line 165):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

  Find (Accuracy Trend empty, line 207):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

  Find (Weakest Pairs empty, line 237):

  ```html
  class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800"
  ```

  Replace with:

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-6 text-center text-surface-500
  dark:text-surface-400"
  ```

- [ ] **Step 2: Fix stat cards in Overall section (five cards)**

  Each stat card wrapper uses `rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800`.

  Find (all five — identical class, use replace_all):

  ```html
  class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800"
  ```

  Replace with (replace_all):

  ```html
  class="rounded-lg bg-surface-100 dark:bg-surface-800 p-4 text-center"
  ```

- [ ] **Step 3: Replace all `text-sm text-gray-500` in the file (use replace_all)**

  This class appears in: stat card labels (5×), pair topic text, and settings subtitle — 7 occurrences total. Replace all at once.

  Find (replace_all):

  ```html
  class="text-sm text-gray-500"
  ```

  Replace with (replace_all):

  ```html
  class="text-sm text-surface-500 dark:text-surface-400"
  ```

- [ ] **Step 4: Fix Topics table thead and rows**

  Find (topics thead, line 174):

  ```html
  class="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-700"
  ```

  Replace with:

  ```html
  class="border-b border-surface-200 text-xs uppercase text-surface-500 dark:text-surface-400
  dark:border-surface-700"
  ```

  Find (topics rows, line 189):

  ```html
  class="border-b border-gray-100 dark:border-gray-800"
  ```

  Replace with:

  ```html
  class="border-b border-surface-100 dark:border-surface-800"
  ```

- [ ] **Step 5: Fix accuracy trend date labels**

  Find (line 225):

  ```html
  <div class="mt-1 flex justify-between text-xs text-gray-400"></div>
  ```

  Replace with:

  ```html
  <div class="mt-1 flex justify-between text-xs text-surface-500 dark:text-surface-400"></div>
  ```

- [ ] **Step 6: Fix weakest pairs card borders and remaining text**

  Find (pair card wrapper, line 248):

  ```html
  class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3
  dark:border-gray-700"
  ```

  Replace with:

  ```html
  class="flex items-center justify-between rounded-lg border border-surface-200 px-4 py-3
  dark:border-surface-700"
  ```

  Find (pair attempts text — `text-xs`, not covered by Step 3's replace_all, line 256):

  ```html
  <p class="text-xs text-gray-500">{{ pair.attempts }} attempts</p>
  ```

  Replace with:

  ```html
  <p class="text-xs text-surface-500 dark:text-surface-400">{{ pair.attempts }} attempts</p>
  ```

- [ ] **Step 7: Fix Settings section border and note text**

  Find (settings card, line 271):

  ```html
  <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"></div>
  ```

  Replace with:

  ```html
  <div class="rounded-lg border border-surface-200 p-4 dark:border-surface-700"></div>
  ```

  Find (settings note — `text-gray-400`, not covered by Step 3, line 277):

  ```html
  <p class="text-sm text-gray-400">Toggle coming in next update</p>
  ```

  Replace with:

  ```html
  <p class="text-sm text-surface-500 dark:text-surface-400">Toggle coming in next update</p>
  ```

- [ ] **Step 8: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 9: Commit**

  ```bash
  git add app/pages/profile.vue
  git commit -m "fix(theme): replace raw gray-* classes with surface-* tokens in profile"
  ```

---

## Task 10: Fix index.vue — undefined token and gray border/hover classes

**Files:**

- Modify: `app/pages/index.vue`

- [ ] **Step 1: Fix the subtitle text (line 43)**

  `text-surface-600` was undefined. In dark mode the `dark:text-surface-400` (also undefined) shows broken text. Replace both.

  Find:

  ```html
  <p class="text-lg text-surface-600 dark:text-surface-400"></p>
  ```

  Replace with:

  ```html
  <p class="text-lg text-surface-700 dark:text-surface-300"></p>
  ```

- [ ] **Step 2: Fix nav button borders and hover states (lines 61–71)**

  Both "Leaderboard" and "Profile" NuxtLinks use raw gray classes. Both have identical class strings.

  Find (use replace_all — both links share the exact same class):

  ```html
  class="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition
  hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
  ```

  Replace with (replace_all):

  ```html
  class="rounded-lg border border-surface-200 px-6 py-3 text-center font-medium transition
  hover:bg-surface-100 dark:border-surface-700 dark:hover:bg-surface-800"
  ```

- [ ] **Step 3: Verify lint passes**

  Run: `pnpm lint`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add app/pages/index.vue
  git commit -m "fix(theme): fix undefined surface-600 token and gray border classes in index"
  ```

---

## Final Verification

- [ ] **Run full test suite**

  ```bash
  pnpm test:run
  ```

  Expected: all tests pass (no logic was changed — these are CSS/template-only edits)

- [ ] **Run lint one final time**

  ```bash
  pnpm lint
  ```

  Expected: no errors
