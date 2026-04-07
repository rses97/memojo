# Game Result Modals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all game completion UIs with two consistent full-screen takeover components — `GameResultModal.vue` (final game-over) and a restyled `GameLevelComplete.vue` (between-levels) — using a spring Fade+Pop animation.

**Architecture:** Create `GameResultModal.vue` as a `position: fixed; inset: 0` overlay with an indigo gradient and Fade+Pop spring animation, used across `daily.vue`, `play/[slug].vue`, and `topics/[slug].vue`. Restyle `GameLevelComplete.vue` in-place (same props/emits API) with a blue tinted gradient and level progress pips. Both components use CSS `@keyframes` in a `<style scoped>` block for the animation; `prefers-reduced-motion` falls back to a plain fade.

**Tech Stack:** Vue 3 `<script setup>`, Tailwind CSS v4 (utility classes), scoped CSS (`<style scoped>`) for gradients + keyframes, `@nuxt/test-utils` + Vitest for component tests.

---

## File Map

| Action | Path                                         | Responsibility                                        |
| ------ | -------------------------------------------- | ----------------------------------------------------- |
| Create | `app/components/game/GameResultModal.vue`    | Final game-over full-screen overlay                   |
| Modify | `app/components/game/GameLevelComplete.vue`  | Restyle to blue fixed overlay (API unchanged)         |
| Modify | `app/pages/daily.vue`                        | Use `<GameResultModal>` instead of inline block       |
| Modify | `app/pages/play/[slug].vue`                  | Use `<GameResultModal>` instead of inline fixed modal |
| Modify | `app/pages/topics/[slug].vue`                | Use `<GameResultModal>` for all-levels-complete       |
| Create | `tests/components/GameResultModal.test.ts`   | Component tests for GameResultModal                   |
| Create | `tests/components/GameLevelComplete.test.ts` | Component tests for restyled GameLevelComplete        |

---

## Task 1: Create `GameResultModal.vue` (TDD)

**Files:**

- Create: `tests/components/GameResultModal.test.ts`
- Create: `app/components/game/GameResultModal.vue`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/GameResultModal.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameResultModal from '~/components/game/GameResultModal.vue'

describe('GameResultModal', () => {
  const baseProps = {
    title: 'Challenge Complete!',
    emoji: '🎉',
    score: 480,
    stats: '5 / 5 pairs matched in 12 moves',
  }

  it('renders emoji, title, score, and stats', async () => {
    const wrapper = await mountSuspended(GameResultModal, { props: baseProps })
    expect(wrapper.text()).toContain('🎉')
    expect(wrapper.text()).toContain('Challenge Complete!')
    expect(wrapper.text()).toContain('480')
    expect(wrapper.text()).toContain('5 / 5 pairs matched in 12 moves')
  })

  it('renders slotted actions', async () => {
    const wrapper = await mountSuspended(GameResultModal, {
      props: baseProps,
      slots: { actions: '<button>Back to Menu</button>' },
    })
    expect(wrapper.text()).toContain('Back to Menu')
  })

  it('applies fixed positioning class', async () => {
    const wrapper = await mountSuspended(GameResultModal, { props: baseProps })
    expect(wrapper.classes()).toContain('fixed')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/components/GameResultModal.test.ts
```

Expected: FAIL — "Cannot find module '~/components/game/GameResultModal.vue'"

- [ ] **Step 3: Implement `GameResultModal.vue`**

Create `app/components/game/GameResultModal.vue`:

```vue
<script setup lang="ts">
defineProps<{
  title: string
  emoji: string
  score: number
  stats: string
}>()
</script>

<template>
  <div class="game-result-modal fixed inset-0 z-50 flex items-center justify-center text-center">
    <div class="px-8">
      <div class="mb-4 text-5xl">{{ emoji }}</div>
      <h2 class="mb-3 text-3xl font-bold text-primary-400">{{ title }}</h2>
      <p class="mb-2 text-lg text-surface-200">
        Score: <span class="font-bold">{{ score }}</span>
      </p>
      <p class="mb-8 text-sm text-surface-400">{{ stats }}</p>
      <div class="flex justify-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-result-modal {
  background: linear-gradient(135deg, #1e1e3f, #2d1b69);
  animation: fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

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

@media (prefers-reduced-motion: reduce) {
  .game-result-modal {
    animation: fadeIn 0.3s ease both;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/components/GameResultModal.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add app/components/game/GameResultModal.vue tests/components/GameResultModal.test.ts
git commit -m "feat(ui): add GameResultModal full-screen takeover component"
```

---

## Task 2: Restyle `GameLevelComplete.vue` (TDD)

**Files:**

- Create: `tests/components/GameLevelComplete.test.ts`
- Modify: `app/components/game/GameLevelComplete.vue`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/GameLevelComplete.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameLevelComplete from '~/components/game/GameLevelComplete.vue'

describe('GameLevelComplete', () => {
  const baseProps = {
    levelIndex: 0,
    totalLevels: 3,
    score: 320,
    isLastLevel: false,
  }

  it('renders level title and score', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.text()).toContain('Level 1 Complete!')
    expect(wrapper.text()).toContain('320')
  })

  it('shows "Level X of Y" badge', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.text()).toContain('Level 1 of 3')
  })

  it('renders correct number of progress pips', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.findAll('[data-testid="progress-pip"]')).toHaveLength(3)
  })

  it('marks completed levels as done', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    const pips = wrapper.findAll('[data-testid="progress-pip"]')
    expect(pips[0]!.classes()).toContain('pip--done')
    expect(pips[1]!.classes()).not.toContain('pip--done')
    expect(pips[2]!.classes()).not.toContain('pip--done')
  })

  it('shows "Next Level" button when not last level', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.find('button').text()).toContain('Next Level')
  })

  it('shows "View Results" button on last level', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, {
      props: { ...baseProps, isLastLevel: true },
    })
    expect(wrapper.find('button').text()).toContain('View Results')
  })

  it('emits next when button clicked', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('applies fixed positioning class', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.classes()).toContain('fixed')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/components/GameLevelComplete.test.ts
```

Expected: FAIL — several tests will fail (no badge, no pips, no fixed class)

- [ ] **Step 3: Restyle `GameLevelComplete.vue`**

Replace the entire file `app/components/game/GameLevelComplete.vue`:

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
  <div class="game-level-complete fixed inset-0 z-50 flex items-center justify-center text-center">
    <div class="px-8">
      <div
        class="mb-4 inline-block rounded-full border border-blue-500/25 bg-blue-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300"
      >
        Level {{ levelIndex + 1 }} of {{ totalLevels }}
      </div>
      <h2 class="mb-3 text-3xl font-bold text-blue-200">Level {{ levelIndex + 1 }} Complete!</h2>
      <p class="mb-2 text-lg text-surface-200">
        Score: <span class="font-bold text-blue-300">{{ score }}</span>
      </p>
      <div class="mb-6 flex justify-center gap-2">
        <div
          v-for="i in totalLevels"
          :key="i"
          :class="['pip', { 'pip--done': i <= levelIndex + 1 }]"
          data-testid="progress-pip"
        />
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        @click="emit('next')"
      >
        {{ isLastLevel ? 'View Results' : 'Next Level →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-level-complete {
  background: linear-gradient(160deg, #1a2035, #1e2d4a);
  animation: fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

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

@media (prefers-reduced-motion: reduce) {
  .game-level-complete {
    animation: fadeIn 0.3s ease both;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.pip {
  width: 28px;
  height: 5px;
  border-radius: 3px;
  background: #1e3a5f;
}

.pip--done {
  background: #3b82f6;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/components/GameLevelComplete.test.ts
```

Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add app/components/game/GameLevelComplete.vue tests/components/GameLevelComplete.test.ts
git commit -m "feat(ui): restyle GameLevelComplete as blue fixed overlay with progress pips"
```

---

## Task 3: Update `daily.vue`

**Files:**

- Modify: `app/pages/daily.vue`

- [ ] **Step 1: Replace the inline completion block**

In `app/pages/daily.vue`, find and replace the `v-if="isGameOver"` div (lines 146–166):

**Remove this block:**

```html
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
  <p class="text-sm text-surface-700 dark:text-surface-300">
    {{ game.matchedPairs.value }} / {{ game.totalPairs.value }} pairs matched in {{ game.moves.value
    }} moves
  </p>
  <NuxtLink
    to="/"
    class="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
  >
    Back to Menu
  </NuxtLink>
</div>
```

**Add this block in its place** (still inside the `<template v-else>` block, after `<GameBoard>`):

```html
<GameResultModal
  v-if="isGameOver"
  :title="game.isComplete.value ? 'Challenge Complete!' : 'Time\'s Up!'"
  :emoji="game.isComplete.value ? '🎉' : '⏰'"
  :score="finalScore"
  :stats="`${game.matchedPairs.value} / ${game.totalPairs.value} pairs matched in ${game.moves.value} moves`"
>
  <template #actions>
    <NuxtLink
      to="/"
      class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
    >
      Back to Menu
    </NuxtLink>
  </template>
</GameResultModal>
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000/daily`, complete (or wait for timeout on) the game. The full-screen indigo overlay with Fade+Pop animation should appear.

- [ ] **Step 3: Commit**

```bash
git add app/pages/daily.vue
git commit -m "feat(daily): replace inline result block with GameResultModal"
```

---

## Task 4: Update `play/[slug].vue`

**Files:**

- Modify: `app/pages/play/[slug].vue`

- [ ] **Step 1: Replace the existing fixed modal**

In `app/pages/play/[slug].vue`, find and remove the entire `v-if="finalScore !== null"` div (lines 194–237):

**Remove:**

```html
<div
  v-if="finalScore !== null"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
>
  <div
    class="mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-surface-800 p-8 text-center shadow-xl"
  >
    <h2 class="mb-2 text-3xl font-bold dark:text-surface-50">
      {{ isComplete ? 'Well Done!' : "Time's Up!" }}
    </h2>
    <p class="mb-6 text-surface-700 dark:text-surface-300">
      {{ isComplete ? 'You matched all pairs!' : 'Better luck next time.' }}
    </p>
    <div class="mb-6 space-y-2 text-lg">
      <div>
        Score:
        <span class="font-bold text-primary-600">{{ finalScore }}</span>
      </div>
      <div>Moves: <span class="font-bold">{{ moves }}</span></div>
      <div>Best Streak: <span class="font-bold">{{ maxStreak }}x</span></div>
      <div>Time: <span class="font-bold">{{ elapsed }}s</span></div>
    </div>
    <div class="flex justify-center gap-3">
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
```

**Add in its place** (after the `</ClientOnly>` closing tag):

```html
<GameResultModal
  v-if="finalScore !== null"
  :title="isComplete ? 'Well Done!' : 'Time\'s Up!'"
  :emoji="isComplete ? '🎉' : '⏰'"
  :score="finalScore"
  :stats="`${matchedPairs} / ${totalPairs} pairs · ${moves} moves · best streak ${maxStreak}x`"
>
  <template #actions>
    <button
      class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
      @click="startGame"
    >
      Play Again
    </button>
    <NuxtLink
      to="/"
      class="rounded-xl bg-surface-700 px-6 py-3 font-semibold text-surface-200 transition-colors hover:bg-surface-600"
    >
      Home
    </NuxtLink>
  </template>
</GameResultModal>
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000/play/world-flags`, complete the game. Full-screen indigo overlay should appear with Play Again + Home buttons.

- [ ] **Step 3: Commit**

```bash
git add app/pages/play/[slug].vue
git commit -m "feat(play): replace inline modal with GameResultModal"
```

---

## Task 5: Update `topics/[slug].vue`

**Files:**

- Modify: `app/pages/topics/[slug].vue`

- [ ] **Step 1: Replace the "All Levels Complete" inline block**

In `app/pages/topics/[slug].vue`, find and remove the `v-else-if="practice.isAllComplete.value"` template block (lines 178–203):

**Remove:**

```html
<template v-else-if="practice.isAllComplete.value">
  <div class="rounded-2xl bg-surface-50 p-8 text-center shadow-lg dark:bg-surface-800">
    <h2 class="mb-4 text-3xl font-bold text-primary-500">All Levels Complete!</h2>
    <p class="mb-2 text-lg text-surface-700 dark:text-surface-200">
      Total Score:
      <span class="font-bold">{{ practice.totalScore.value }}</span>
    </p>
    <p class="mb-6 text-sm text-surface-700 dark:text-surface-300">
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
```

**Add in its place:**

```html
<template v-else-if="practice.isAllComplete.value">
  <GameResultModal
    title="All Levels Complete!"
    emoji="🏆"
    :score="practice.totalScore.value"
    :stats="`You completed all ${practice.totalLevels.value} levels`"
  >
    <template #actions>
      <button
        class="rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        @click="handleRestart"
      >
        Play Again
      </button>
      <NuxtLink
        to="/topics"
        class="rounded-xl bg-surface-700 px-6 py-3 font-semibold text-surface-200 transition-colors hover:bg-surface-600"
      >
        Other Topics
      </NuxtLink>
    </template>
  </GameResultModal>
</template>
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Open a topic (e.g. `http://localhost:3000/topics/world-flags`), complete all 3 levels. Each level-complete screen should show the blue overlay with progress pips. The final "All Levels Complete" screen should show the indigo overlay.

- [ ] **Step 3: Commit**

```bash
git add app/pages/topics/[slug].vue
git commit -m "feat(topics): replace inline result blocks with GameResultModal and restyled GameLevelComplete"
```

---

## Task 6: Run full test suite

- [ ] **Step 1: Run all tests**

```bash
pnpm test:run
```

Expected: all tests pass, no regressions.

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: no errors.
