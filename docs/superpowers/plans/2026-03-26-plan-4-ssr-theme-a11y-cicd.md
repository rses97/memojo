# Plan 4: SSR, Theme, Accessibility & CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the memory game with SSR-optimized SEO pages, dark/light theme toggle, full accessibility compliance, additional topic packs, and a CI/CD pipeline with linting and deployment config.

**Architecture:** SSR is enabled by default for topic listing/detail pages with `useHead()` and JSON-LD structured data, while game pages are excluded via Nuxt route rules. Dark mode uses Tailwind v4's class-based `dark:` variant with CSS-first overrides in `main.css`, driven by a Pinia-persisted preference. Accessibility is achieved through ARIA live regions, keyboard grid navigation via a `useGridNavigation` composable, and focus management. CI runs lint, typecheck, and tests on every PR via GitHub Actions.

**Tech Stack:** Nuxt 4, TypeScript (strict), Tailwind CSS v4 (CSS-first @theme), Pinia, Vitest, @nuxt/eslint, Prettier, GitHub Actions, Vercel

**Plan series:** This is Plan 4 of 4. Plans 1-3 established the full game with all modes, persistence, adaptive difficulty, and leaderboards.

---

## File Structure (new/modified files in this plan)

```
memojo/
├── .github/
│   └── workflows/
│       └── ci.yml                          # CI pipeline
├── app/
│   ├── assets/css/main.css                 # Dark theme overrides (modify)
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameBoard.vue               # Keyboard nav + ARIA (modify)
│   │   │   └── GameCard.vue                # ARIA labels (modify)
│   │   └── ui/
│   │       ├── ThemeToggle.vue             # Dark/light toggle
│   │       └── SkipToContent.vue           # Skip-to-content link
│   ├── composables/
│   │   └── useGridNavigation.ts            # Arrow-key grid navigation
│   ├── layouts/default.vue                 # Add ThemeToggle, SkipToContent, aria-live (modify)
│   ├── pages/
│   │   ├── index.vue                       # SEO meta (modify)
│   │   ├── topics/index.vue                # SEO meta + JSON-LD (modify)
│   │   └── topics/[slug].vue              # SEO meta + JSON-LD (modify)
│   └── stores/user.ts                      # Theme init logic (modify)
├── public/
│   ├── img/
│   │   ├── solar-system/                   # Placeholder images
│   │   ├── animals/                        # Placeholder images
│   │   ├── human-body/                     # Placeholder images
│   │   └── landmarks/                      # Placeholder images
│   └── topics/
│       ├── index.json                      # Updated manifest (modify)
│       ├── solar-system.json               # New topic pack
│       ├── animals.json                    # New topic pack
│       ├── human-body.json                 # New topic pack
│       └── world-landmarks.json            # New topic pack
├── tests/
│   ├── unit/
│   │   └── useGridNavigation.test.ts       # Grid nav tests
│   └── components/
│       └── ThemeToggle.test.ts             # Theme toggle tests
├── nuxt.config.ts                          # Route rules (modify)
├── eslint.config.mjs                       # ESLint flat config
├── .prettierrc                             # Prettier config
├── .prettierignore                         # Prettier ignore
└── vercel.json                             # Vercel deployment config
```

---

### Task 1: ESLint + Prettier Setup

**Files:**

- Create: `eslint.config.mjs`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `package.json`

- [ ] **Step 1: Install ESLint and Prettier dependencies**

```bash
pnpm add -D @nuxt/eslint eslint prettier eslint-config-prettier eslint-plugin-prettier
```

- [ ] **Step 2: Create ESLint flat config**

Create `eslint.config.mjs`:

```javascript
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: false,
  },
})
  .prepend({
    name: 'app/global-ignores',
    ignores: ['.nuxt/', '.output/', 'node_modules/', 'dist/', 'public/', '.vercel/'],
  })
  .append({
    name: 'app/custom-rules',
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  })
```

- [ ] **Step 3: Create Prettier config**

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "vueIndentScriptAndStyle": false
}
```

Create `.prettierignore`:

```
.nuxt
.output
node_modules
dist
public
pnpm-lock.yaml
```

- [ ] **Step 4: Add lint scripts to package.json**

Add to the `"scripts"` section in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Keep all existing scripts (`dev`, `build`, `test`, `test:run`, etc.).

- [ ] **Step 5: Add @nuxt/eslint module to nuxt.config.ts**

Add `'@nuxt/eslint'` to the `modules` array in `nuxt.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  modules: ['@pinia/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],

  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 6: Run lint and fix existing issues**

```bash
pnpm lint:fix
pnpm format
```

Review and manually fix any issues the auto-fixer cannot resolve.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.mjs .prettierrc .prettierignore package.json nuxt.config.ts
git add -u
git commit -m "chore: add ESLint flat config with @nuxt/eslint and Prettier"
```

---

### Task 2: Dark/Light Theme CSS Overrides

**Files:**

- Modify: `app/assets/css/main.css`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Add dark variant and dark theme color overrides to main.css**

Append to `app/assets/css/main.css` after the existing `@theme` block:

```css
@variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;

    --color-primary-50: oklch(0.2 0.02 260);
    --color-primary-100: oklch(0.25 0.04 260);
    --color-primary-200: oklch(0.3 0.06 260);
    --color-primary-300: oklch(0.4 0.1 260);
    --color-primary-400: oklch(0.55 0.15 260);
    --color-primary-500: oklch(0.65 0.18 260);
    --color-primary-600: oklch(0.72 0.16 260);
    --color-primary-700: oklch(0.8 0.12 260);
    --color-primary-800: oklch(0.88 0.08 260);
    --color-primary-900: oklch(0.94 0.04 260);

    --color-surface-50: oklch(0.15 0.01 260);
    --color-surface-100: oklch(0.18 0.015 260);
    --color-surface-200: oklch(0.22 0.02 260);
    --color-surface-700: oklch(0.75 0.02 260);
    --color-surface-800: oklch(0.85 0.015 260);
    --color-surface-900: oklch(0.93 0.01 260);

    --color-success: oklch(0.7 0.16 145);
    --color-danger: oklch(0.65 0.18 25);
  }
}
```

- [ ] **Step 2: Add prefers-reduced-motion global rule to main.css**

Append to `app/assets/css/main.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/assets/css/main.css
git commit -m "feat: add dark theme color overrides and reduced-motion support in main.css"
```

---

### Task 3: Theme Toggle Component (TDD)

**Files:**

- Create: `app/components/ui/ThemeToggle.vue`
- Test: `tests/components/ThemeToggle.test.ts`
- Modify: `app/stores/user.ts`

- [ ] **Step 1: Write ThemeToggle component tests**

Create `tests/components/ThemeToggle.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemeToggle from '~/components/ui/ThemeToggle.vue'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('renders a button with accessible label', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('toggles dark class on document when clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await button.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('displays sun icon in dark mode and moon icon in light mode', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    // Initially light mode — should show moon icon (to switch to dark)
    expect(wrapper.find('[data-testid="icon-moon"]').exists()).toBe(true)

    await wrapper.find('button').trigger('click')

    // Now dark mode — should show sun icon (to switch to light)
    expect(wrapper.find('[data-testid="icon-sun"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Update user store with theme initialization logic**

Modify `app/stores/user.ts` to add theme initialization that respects `prefers-color-scheme` as default. Add these to the existing store:

```typescript
// Add to existing user.ts store — inside the setup function:

const theme = ref<'light' | 'dark' | 'system'>('system')

const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (theme.value !== 'system') return theme.value
  if (import.meta.client) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
})

function toggleTheme() {
  if (resolvedTheme.value === 'dark') {
    theme.value = 'light'
  } else {
    theme.value = 'dark'
  }
}

function initTheme() {
  if (import.meta.client) {
    const applyTheme = () => {
      if (resolvedTheme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    applyTheme()
    watch(resolvedTheme, applyTheme)
  }
}

// Add to the returned object:
// theme, resolvedTheme, toggleTheme, initTheme
```

Ensure `theme` is included in the properties persisted to IndexedDB alongside existing preferences.

- [ ] **Step 3: Create ThemeToggle component**

Create `app/components/ui/ThemeToggle.vue`:

```vue
<script setup lang="ts">
const userStore = useUserStore()

onMounted(() => {
  userStore.initTheme()
})
</script>

<template>
  <button
    type="button"
    :aria-label="
      userStore.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    "
    class="rounded-lg p-2 text-surface-700 transition-colors hover:bg-surface-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    @click="userStore.toggleTheme()"
  >
    <!-- Sun icon (shown in dark mode) -->
    <svg
      v-if="userStore.resolvedTheme === 'dark'"
      data-testid="icon-sun"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>

    <!-- Moon icon (shown in light mode) -->
    <svg
      v-else
      data-testid="icon-moon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  </button>
</template>
```

- [ ] **Step 4: Run tests**

```bash
pnpm test:run tests/components/ThemeToggle.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/ThemeToggle.vue app/stores/user.ts tests/components/ThemeToggle.test.ts
git commit -m "feat: add dark/light theme toggle with system preference detection"
```

---

### Task 4: Accessibility — Skip-to-Content, ARIA Live Region & Layout Updates

**Files:**

- Create: `app/components/ui/SkipToContent.vue`
- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Create SkipToContent component**

Create `app/components/ui/SkipToContent.vue`:

```vue
<template>
  <a
    href="#main-content"
    class="fixed left-2 top-2 z-[100] -translate-y-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-primary-500"
  >
    Skip to content
  </a>
</template>
```

- [ ] **Step 2: Update default layout with ThemeToggle, SkipToContent, and ARIA live region**

Modify `app/layouts/default.vue`:

```vue
<script setup lang="ts">
const userStore = useUserStore()

onMounted(() => {
  userStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-surface-50 text-surface-900">
    <SkipToContent />

    <header class="border-b border-surface-200 bg-white dark:bg-surface-100">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NuxtLink
          to="/"
          class="text-lg font-bold text-primary-600 hover:text-primary-700"
          aria-label="Memojo — Home"
        >
          Memojo
        </NuxtLink>

        <nav class="flex items-center gap-4" aria-label="Main navigation">
          <NuxtLink
            to="/topics"
            class="text-sm font-medium text-surface-700 hover:text-primary-600"
          >
            Topics
          </NuxtLink>
          <NuxtLink to="/daily" class="text-sm font-medium text-surface-700 hover:text-primary-600">
            Daily
          </NuxtLink>
          <NuxtLink
            to="/leaderboard"
            class="text-sm font-medium text-surface-700 hover:text-primary-600"
          >
            Leaderboard
          </NuxtLink>
          <NuxtLink
            to="/profile"
            class="text-sm font-medium text-surface-700 hover:text-primary-600"
          >
            Profile
          </NuxtLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <main id="main-content" class="mx-auto max-w-5xl px-4 py-8" tabindex="-1">
      <slot />
    </main>

    <!-- Screen reader announcements -->
    <div id="sr-announcements" aria-live="assertive" aria-atomic="true" class="sr-only" />
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/SkipToContent.vue app/layouts/default.vue
git commit -m "feat: add skip-to-content link, ARIA live region, and theme toggle to layout"
```

---

### Task 5: Accessibility — Keyboard Grid Navigation (TDD)

**Files:**

- Create: `app/composables/useGridNavigation.ts`
- Test: `tests/unit/useGridNavigation.test.ts`
- Modify: `app/components/game/GameBoard.vue`
- Modify: `app/components/game/GameCard.vue`

- [ ] **Step 1: Write useGridNavigation tests**

Create `tests/unit/useGridNavigation.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useGridNavigation', () => {
  const cols = 4
  const totalCards = 8

  function createNavigation(cardCount: number, gridCols: number) {
    const focusedIndex = ref(0)

    function handleKeydown(event: { key: string; preventDefault: () => void }) {
      const row = Math.floor(focusedIndex.value / gridCols)
      const col = focusedIndex.value % gridCols
      const totalRows = Math.ceil(cardCount / gridCols)
      let newIndex = focusedIndex.value

      switch (event.key) {
        case 'ArrowRight':
          newIndex = row * gridCols + ((col + 1) % gridCols)
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowLeft':
          newIndex = row * gridCols + ((col - 1 + gridCols) % gridCols)
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowDown':
          newIndex = ((row + 1) % totalRows) * gridCols + col
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowUp':
          newIndex = ((row - 1 + totalRows) % totalRows) * gridCols + col
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
      }
      focusedIndex.value = newIndex
    }

    return { focusedIndex, handleKeydown }
  }

  it('moves focus right on ArrowRight', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowRight', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(1)
  })

  it('moves focus left on ArrowLeft with wrap', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowLeft', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(3)
  })

  it('moves focus down on ArrowDown', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowDown', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(4)
  })

  it('moves focus up on ArrowUp with wrap', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowUp', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(4)
  })

  it('does not move past totalCards boundary', () => {
    const { focusedIndex, handleKeydown } = createNavigation(6, 4)
    focusedIndex.value = 5 // row 1, col 1
    handleKeydown({ key: 'ArrowRight', preventDefault: vi.fn() })
    // row 1, col 2 = index 6 which is >= 6, so stay at 5
    expect(focusedIndex.value).toBe(5)
  })

  it('prevents default on arrow keys', () => {
    const { handleKeydown } = createNavigation(totalCards, cols)
    const preventDefault = vi.fn()
    handleKeydown({ key: 'ArrowRight', preventDefault })
    expect(preventDefault).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Create useGridNavigation composable**

Create `app/composables/useGridNavigation.ts`:

```typescript
export function useGridNavigation(
  totalCards: Ref<number> | ComputedRef<number>,
  gridCols: Ref<number> | ComputedRef<number>,
) {
  const focusedIndex = ref(0)

  function handleKeydown(event: KeyboardEvent) {
    const count = toValue(totalCards)
    const cols = toValue(gridCols)
    const row = Math.floor(focusedIndex.value / cols)
    const col = focusedIndex.value % cols
    const totalRows = Math.ceil(count / cols)
    let newIndex = focusedIndex.value

    switch (event.key) {
      case 'ArrowRight':
        newIndex = row * cols + ((col + 1) % cols)
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowLeft':
        newIndex = row * cols + ((col - 1 + cols) % cols)
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowDown':
        newIndex = ((row + 1) % totalRows) * cols + col
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowUp':
        newIndex = ((row - 1 + totalRows) % totalRows) * cols + col
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
    }

    focusedIndex.value = newIndex
  }

  function resetFocus() {
    focusedIndex.value = 0
  }

  return {
    focusedIndex,
    handleKeydown,
    resetFocus,
  }
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm test:run tests/unit/useGridNavigation.test.ts
```

- [ ] **Step 4: Update GameBoard with keyboard navigation and screen reader announcements**

Modify `app/components/game/GameBoard.vue` to integrate keyboard navigation. Add the following to the existing component:

```vue
<script setup lang="ts">
import type { GameCard } from '~/types'

const props = defineProps<{
  cards: GameCard[]
  gridCols: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  flip: [cardId: string]
}>()

const cardCount = computed(() => props.cards.length)
const cols = computed(() => props.gridCols)

const { focusedIndex, handleKeydown } = useGridNavigation(cardCount, cols)

const cardRefs = ref<HTMLElement[]>([])

watch(focusedIndex, (newIndex) => {
  cardRefs.value[newIndex]?.focus()
})

function announce(message: string) {
  const el = document.getElementById('sr-announcements')
  if (el) {
    el.textContent = ''
    nextTick(() => {
      el!.textContent = message
    })
  }
}

function handleCardFlip(cardId: string, card: GameCard) {
  if (props.disabled || card.isFlipped || card.isMatched) return
  emit('flip', cardId)
}

function handleCardKeydown(event: KeyboardEvent, card: GameCard) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleCardFlip(card.id, card)
  } else {
    handleKeydown(event)
  }
}

defineExpose({ announce })
</script>

<template>
  <div
    role="grid"
    :aria-label="`Memory game board, ${cards.length} cards in ${gridCols} columns`"
    class="grid gap-3"
    :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }"
  >
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      :ref="
        (el) => {
          if (el) cardRefs[index] = el as HTMLElement
        }
      "
      role="gridcell"
    >
      <GameCard
        :card="card"
        :tabindex="index === focusedIndex ? 0 : -1"
        :aria-label="
          card.isFlipped || card.isMatched
            ? `Card: ${card.content}${card.isMatched ? ', matched' : ''}`
            : `Card ${index + 1}, face down`
        "
        @click="handleCardFlip(card.id, card)"
        @keydown="handleCardKeydown($event, card)"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Update GameCard with ARIA attributes**

Modify `app/components/game/GameCard.vue` to accept and forward accessibility attributes:

```vue
<script setup lang="ts">
import type { GameCard } from '~/types'

const props = defineProps<{
  card: GameCard
  tabindex?: number
  ariaLabel?: string
}>()

defineEmits<{
  click: []
  keydown: [event: KeyboardEvent]
}>()
</script>

<template>
  <button
    type="button"
    class="relative aspect-[3/4] w-full cursor-pointer select-none rounded-card transition-transform"
    :class="{
      'ring-2 ring-success': card.isMatched,
      '[transform:rotateY(180deg)]': card.isFlipped || card.isMatched,
      'hover:scale-105': !card.isFlipped && !card.isMatched,
    }"
    :tabindex="tabindex ?? 0"
    :aria-label="ariaLabel"
    :disabled="card.isMatched"
    style="transform-style: preserve-3d; transition: transform 0.5s var(--ease-flip)"
    @click="$emit('click')"
    @keydown="$emit('keydown', $event)"
  >
    <!-- Card back (face down) -->
    <div
      class="absolute inset-0 flex items-center justify-center rounded-card bg-primary-500 text-white backface-hidden"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        />
      </svg>
    </div>

    <!-- Card front (face up) -->
    <div
      class="absolute inset-0 flex items-center justify-center rounded-card bg-white p-2 text-surface-900 [transform:rotateY(180deg)] backface-hidden dark:bg-surface-100"
    >
      <img
        v-if="card.type === 'image'"
        :src="card.content"
        :alt="card.pairId"
        class="max-h-full max-w-full object-contain"
        loading="lazy"
        width="120"
        height="80"
      />
      <span v-else class="text-center text-sm font-semibold">
        {{ card.content }}
      </span>
    </div>
  </button>
</template>
```

- [ ] **Step 6: Commit**

```bash
git add app/composables/useGridNavigation.ts app/components/game/GameBoard.vue app/components/game/GameCard.vue tests/unit/useGridNavigation.test.ts
git commit -m "feat: add keyboard grid navigation and ARIA labels for accessibility"
```

---

### Task 6: SSR Optimization & SEO Meta Tags

**Files:**

- Modify: `nuxt.config.ts`
- Modify: `app/pages/index.vue`
- Modify: `app/pages/topics/index.vue`
- Modify: `app/pages/topics/[slug].vue`

- [ ] **Step 1: Add route rules to nuxt.config.ts to disable SSR for game pages**

Add `routeRules` to `nuxt.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  modules: ['@pinia/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],

  routeRules: {
    '/play/**': { ssr: false },
    '/daily': { ssr: false },
    '/profile': { ssr: false },
    '/leaderboard': { ssr: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
```

- [ ] **Step 2: Add SEO meta to index.vue**

Add to the `<script setup>` section of `app/pages/index.vue`:

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'Memojo — Train Your Brain with Cross-Modal Matching',
  ogTitle: 'Memojo — Train Your Brain with Cross-Modal Matching',
  description:
    'A cross-modal memory game that pairs images with text. Daily challenges, topic practice, adaptive difficulty, and spaced repetition for genuine cognitive training.',
  ogDescription:
    'A cross-modal memory game that pairs images with text. Daily challenges, topic practice, adaptive difficulty, and spaced repetition for genuine cognitive training.',
  ogImage: '/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  title: 'Memojo — Train Your Brain',
})
</script>
```

- [ ] **Step 3: Add SEO meta and JSON-LD to topics/index.vue**

Add to the `<script setup>` section of `app/pages/topics/index.vue`:

```vue
<script setup lang="ts">
import type { TopicPack } from '~/types'

const { data: manifest } = await useFetch<{
  topics: {
    slug: string
    name: string
    description: string
    pairCount: number
    difficulty: string
  }[]
}>('/topics/index.json')

useSeoMeta({
  title: 'Topics — Memojo',
  ogTitle: 'Topics — Memojo',
  description:
    'Browse memory game topics: World Flags, Solar System, Animals, Human Body, and World Landmarks. Pick a topic and start training your memory.',
  ogDescription:
    'Browse memory game topics: World Flags, Solar System, Animals, Human Body, and World Landmarks. Pick a topic and start training your memory.',
  ogImage: '/og-image.png',
  ogType: 'website',
})

useHead({
  title: 'Topics — Memojo',
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Memojo Topics',
        description: 'Browse memory game topic packs for cross-modal matching practice.',
        url: 'https://memojo.vercel.app/topics',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: (manifest.value?.topics ?? []).map((topic, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: topic.name,
            url: `https://memojo.vercel.app/topics/${topic.slug}`,
          })),
        },
      }),
    },
  ],
})
</script>
```

- [ ] **Step 4: Add SEO meta and JSON-LD to topics/[slug].vue**

Add to the `<script setup>` section of `app/pages/topics/[slug].vue`:

```vue
<script setup lang="ts">
import type { TopicPack } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

const { data: topic } = await useFetch<TopicPack>(`/topics/${slug}.json`)

if (!topic.value) {
  throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
}

useSeoMeta({
  title: `${topic.value.name} — Memojo`,
  ogTitle: `${topic.value.name} — Memojo`,
  description: `Practice matching ${topic.value.name.toLowerCase()} in this cross-modal memory game. ${topic.value.description}`,
  ogDescription: `Practice matching ${topic.value.name.toLowerCase()} in this cross-modal memory game. ${topic.value.description}`,
  ogImage: '/og-image.png',
  ogType: 'website',
})

useHead({
  title: `${topic.value.name} — Memojo`,
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${topic.value.name} — Memojo`,
        description: topic.value.description,
        url: `https://memojo.vercel.app/topics/${slug}`,
        mainEntity: {
          '@type': 'Game',
          name: topic.value.name,
          description: topic.value.description,
          numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
          gameItem: {
            '@type': 'Thing',
            name: `${topic.value.pairs.length} image-text pairs`,
          },
        },
      }),
    },
  ],
})
</script>
```

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts app/pages/index.vue app/pages/topics/index.vue app/pages/topics/\\[slug\\].vue
git commit -m "feat: add SSR route rules, SEO meta tags, and JSON-LD structured data"
```

---

### Task 7: Additional Topic Packs

**Files:**

- Create: `public/topics/solar-system.json`
- Create: `public/topics/animals.json`
- Create: `public/topics/human-body.json`
- Create: `public/topics/world-landmarks.json`
- Modify: `public/topics/index.json`
- Create: `public/img/solar-system/placeholder.svg`
- Create: `public/img/animals/placeholder.svg`
- Create: `public/img/human-body/placeholder.svg`
- Create: `public/img/landmarks/placeholder.svg`

- [ ] **Step 1: Create Solar System topic pack**

Create `public/topics/solar-system.json`:

```json
{
  "topic": "solar-system",
  "name": "Solar System",
  "description": "Match planets and celestial objects to their names and fun facts",
  "pairs": [
    {
      "id": "mercury",
      "image": "/img/solar-system/mercury.webp",
      "text": "Mercury",
      "hint": "Closest to the Sun"
    },
    {
      "id": "venus",
      "image": "/img/solar-system/venus.webp",
      "text": "Venus",
      "hint": "Hottest planet"
    },
    {
      "id": "earth",
      "image": "/img/solar-system/earth.webp",
      "text": "Earth",
      "hint": "The blue planet"
    },
    {
      "id": "mars",
      "image": "/img/solar-system/mars.webp",
      "text": "Mars",
      "hint": "The red planet"
    },
    {
      "id": "jupiter",
      "image": "/img/solar-system/jupiter.webp",
      "text": "Jupiter",
      "hint": "Largest planet"
    },
    {
      "id": "saturn",
      "image": "/img/solar-system/saturn.webp",
      "text": "Saturn",
      "hint": "Famous for its rings"
    },
    {
      "id": "uranus",
      "image": "/img/solar-system/uranus.webp",
      "text": "Uranus",
      "hint": "Rotates on its side"
    },
    {
      "id": "neptune",
      "image": "/img/solar-system/neptune.webp",
      "text": "Neptune",
      "hint": "Farthest from the Sun"
    },
    {
      "id": "pluto",
      "image": "/img/solar-system/pluto.webp",
      "text": "Pluto",
      "hint": "Dwarf planet"
    },
    {
      "id": "sun",
      "image": "/img/solar-system/sun.webp",
      "text": "Sun",
      "hint": "Our star"
    }
  ]
}
```

- [ ] **Step 2: Create Animals topic pack**

Create `public/topics/animals.json`:

```json
{
  "topic": "animals",
  "name": "Animals",
  "description": "Match animal photos to their species names",
  "pairs": [
    {
      "id": "lion",
      "image": "/img/animals/lion.webp",
      "text": "Lion",
      "hint": "King of the jungle"
    },
    {
      "id": "elephant",
      "image": "/img/animals/elephant.webp",
      "text": "Elephant",
      "hint": "Largest land animal"
    },
    {
      "id": "penguin",
      "image": "/img/animals/penguin.webp",
      "text": "Penguin",
      "hint": "Flightless bird"
    },
    {
      "id": "dolphin",
      "image": "/img/animals/dolphin.webp",
      "text": "Dolphin",
      "hint": "Intelligent marine mammal"
    },
    {
      "id": "eagle",
      "image": "/img/animals/eagle.webp",
      "text": "Eagle",
      "hint": "Bird of prey"
    },
    {
      "id": "panda",
      "image": "/img/animals/panda.webp",
      "text": "Giant Panda",
      "hint": "Eats bamboo"
    },
    {
      "id": "tiger",
      "image": "/img/animals/tiger.webp",
      "text": "Tiger",
      "hint": "Largest wild cat"
    },
    {
      "id": "octopus",
      "image": "/img/animals/octopus.webp",
      "text": "Octopus",
      "hint": "Eight arms"
    },
    {
      "id": "giraffe",
      "image": "/img/animals/giraffe.webp",
      "text": "Giraffe",
      "hint": "Tallest animal"
    },
    {
      "id": "koala",
      "image": "/img/animals/koala.webp",
      "text": "Koala",
      "hint": "Australian marsupial"
    }
  ]
}
```

- [ ] **Step 3: Create Human Body topic pack**

Create `public/topics/human-body.json`:

```json
{
  "topic": "human-body",
  "name": "Human Body",
  "description": "Match organ and system diagrams to their names",
  "pairs": [
    {
      "id": "heart",
      "image": "/img/human-body/heart.webp",
      "text": "Heart",
      "hint": "Pumps blood"
    },
    {
      "id": "brain",
      "image": "/img/human-body/brain.webp",
      "text": "Brain",
      "hint": "Control center"
    },
    {
      "id": "lungs",
      "image": "/img/human-body/lungs.webp",
      "text": "Lungs",
      "hint": "Breathing organs"
    },
    {
      "id": "liver",
      "image": "/img/human-body/liver.webp",
      "text": "Liver",
      "hint": "Detoxification"
    },
    {
      "id": "kidneys",
      "image": "/img/human-body/kidneys.webp",
      "text": "Kidneys",
      "hint": "Filter blood"
    },
    {
      "id": "stomach",
      "image": "/img/human-body/stomach.webp",
      "text": "Stomach",
      "hint": "Digests food"
    },
    {
      "id": "skeleton",
      "image": "/img/human-body/skeleton.webp",
      "text": "Skeletal System",
      "hint": "206 bones"
    },
    {
      "id": "muscles",
      "image": "/img/human-body/muscles.webp",
      "text": "Muscular System",
      "hint": "Over 600 muscles"
    },
    {
      "id": "nervous",
      "image": "/img/human-body/nervous.webp",
      "text": "Nervous System",
      "hint": "Brain and nerves"
    },
    {
      "id": "circulatory",
      "image": "/img/human-body/circulatory.webp",
      "text": "Circulatory System",
      "hint": "Blood vessels"
    }
  ]
}
```

- [ ] **Step 4: Create World Landmarks topic pack**

Create `public/topics/world-landmarks.json`:

```json
{
  "topic": "world-landmarks",
  "name": "World Landmarks",
  "description": "Match famous landmark photos to their names and locations",
  "pairs": [
    {
      "id": "eiffel",
      "image": "/img/landmarks/eiffel.webp",
      "text": "Eiffel Tower",
      "hint": "Paris, France"
    },
    {
      "id": "taj-mahal",
      "image": "/img/landmarks/taj-mahal.webp",
      "text": "Taj Mahal",
      "hint": "Agra, India"
    },
    {
      "id": "great-wall",
      "image": "/img/landmarks/great-wall.webp",
      "text": "Great Wall of China",
      "hint": "China"
    },
    {
      "id": "machu-picchu",
      "image": "/img/landmarks/machu-picchu.webp",
      "text": "Machu Picchu",
      "hint": "Peru"
    },
    {
      "id": "colosseum",
      "image": "/img/landmarks/colosseum.webp",
      "text": "Colosseum",
      "hint": "Rome, Italy"
    },
    {
      "id": "statue-liberty",
      "image": "/img/landmarks/statue-liberty.webp",
      "text": "Statue of Liberty",
      "hint": "New York, USA"
    },
    {
      "id": "pyramids",
      "image": "/img/landmarks/pyramids.webp",
      "text": "Pyramids of Giza",
      "hint": "Cairo, Egypt"
    },
    {
      "id": "sydney-opera",
      "image": "/img/landmarks/sydney-opera.webp",
      "text": "Sydney Opera House",
      "hint": "Sydney, Australia"
    },
    {
      "id": "christ-redeemer",
      "image": "/img/landmarks/christ-redeemer.webp",
      "text": "Christ the Redeemer",
      "hint": "Rio de Janeiro, Brazil"
    },
    {
      "id": "petra",
      "image": "/img/landmarks/petra.webp",
      "text": "Petra",
      "hint": "Jordan"
    }
  ]
}
```

- [ ] **Step 5: Create placeholder images for all new topics**

```bash
mkdir -p public/img/solar-system public/img/animals public/img/human-body public/img/landmarks
```

Create `public/img/solar-system/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
  <rect width="120" height="80" fill="#e2e8f0" rx="4"/>
  <circle cx="60" cy="36" r="16" fill="#94a3b8"/>
  <text x="60" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">Planet</text>
</svg>
```

Copy placeholder for each image file:

```bash
for name in mercury venus earth mars jupiter saturn uranus neptune pluto sun; do
  cp public/img/solar-system/placeholder.svg "public/img/solar-system/${name}.webp"
done

cp public/img/solar-system/placeholder.svg public/img/animals/placeholder.svg
for name in lion elephant penguin dolphin eagle panda tiger octopus giraffe koala; do
  cp public/img/animals/placeholder.svg "public/img/animals/${name}.webp"
done

cp public/img/solar-system/placeholder.svg public/img/human-body/placeholder.svg
for name in heart brain lungs liver kidneys stomach skeleton muscles nervous circulatory; do
  cp public/img/human-body/placeholder.svg "public/img/human-body/${name}.webp"
done

cp public/img/solar-system/placeholder.svg public/img/landmarks/placeholder.svg
for name in eiffel taj-mahal great-wall machu-picchu colosseum statue-liberty pyramids sydney-opera christ-redeemer petra; do
  cp public/img/landmarks/placeholder.svg "public/img/landmarks/${name}.webp"
done
```

- [ ] **Step 6: Update topic manifest**

Replace `public/topics/index.json` with:

```json
{
  "topics": [
    {
      "slug": "world-flags",
      "name": "World Flags",
      "description": "Match country flags to their names",
      "pairCount": 10,
      "difficulty": "beginner",
      "icon": "flag"
    },
    {
      "slug": "solar-system",
      "name": "Solar System",
      "description": "Match planets and celestial objects to their names and fun facts",
      "pairCount": 10,
      "difficulty": "beginner",
      "icon": "planet"
    },
    {
      "slug": "animals",
      "name": "Animals",
      "description": "Match animal photos to their species names",
      "pairCount": 10,
      "difficulty": "beginner",
      "icon": "paw"
    },
    {
      "slug": "human-body",
      "name": "Human Body",
      "description": "Match organ and system diagrams to their names",
      "pairCount": 10,
      "difficulty": "intermediate",
      "icon": "anatomy"
    },
    {
      "slug": "world-landmarks",
      "name": "World Landmarks",
      "description": "Match famous landmark photos to their names and locations",
      "pairCount": 10,
      "difficulty": "intermediate",
      "icon": "landmark"
    }
  ]
}
```

- [ ] **Step 7: Commit**

```bash
git add public/topics/ public/img/
git commit -m "feat: add solar-system, animals, human-body, and world-landmarks topic packs"
```

---

### Task 8: CI/CD Pipeline (GitHub Actions)

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Type check
        run: npx nuxi typecheck

      - name: Unit & component tests
        run: pnpm test:run

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, test, and build"
```

---

### Task 9: Vercel Deployment Config

**Files:**

- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nuxt",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "headers": [
    {
      "source": "/img/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/topics/(.*).json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=86400"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment config with caching headers"
```

---

### Task 10: Performance Audit & Final Polish

**Files:**

- Modify: `app/components/game/GameCard.vue`
- Modify: `app/components/topic/TopicCard.vue`

- [ ] **Step 1: Verify image dimensions on all image elements**

Ensure every `<img>` tag in `GameCard.vue` and `TopicCard.vue` has explicit `width` and `height` attributes and `loading="lazy"`. This was already done for `GameCard.vue` in Task 5. Check `TopicCard.vue`:

Modify `app/components/topic/TopicCard.vue` — ensure any `<img>` tags have:

```html
<img
  :src="topic.pairs[0]?.image"
  :alt="`Preview of ${topic.name}`"
  loading="lazy"
  width="120"
  height="80"
  class="h-20 w-auto rounded object-contain"
/>
```

- [ ] **Step 2: Audit and remove unused dependencies**

```bash
pnpm why <package-name>
```

Review `package.json` for any dependencies not actively imported. Remove with:

```bash
pnpm remove <unused-package>
```

- [ ] **Step 3: Run full test suite and lint**

```bash
pnpm lint
pnpm format:check
pnpm test:run
pnpm build
```

Fix any remaining issues.

- [ ] **Step 4: Final commit**

```bash
git add -u
git commit -m "chore: performance audit — verify image dimensions and remove unused deps"
```

---

### Task 11: Accessibility Screen Reader Announcements in Game Logic

**Files:**

- Modify: `app/composables/useGame.ts`

- [ ] **Step 1: Add screen reader announcements to match/mismatch events**

In `app/composables/useGame.ts`, add an `announce` function and call it on match/mismatch outcomes. Add the following helper and integrate it into the existing flip/match logic:

```typescript
function announceToScreenReader(message: string) {
  if (import.meta.client) {
    const el = document.getElementById('sr-announcements')
    if (el) {
      el.textContent = ''
      nextTick(() => {
        el!.textContent = message
      })
    }
  }
}
```

Call it at the appropriate points in the existing match logic:

```typescript
// After a successful match:
announceToScreenReader(
  `Match found! ${firstCard.content} and ${secondCard.content}. ${matchedPairs.value} of ${totalPairs.value} pairs matched.`,
)

// After a mismatch:
announceToScreenReader(`No match. Cards hidden.`)

// When game is complete:
announceToScreenReader(
  `Congratulations! All ${totalPairs.value} pairs matched. Your score is ${score.value}.`,
)
```

- [ ] **Step 2: Add focus management after match/mismatch**

After a mismatch, return focus to the first unmatched card. After a match, move focus to the next unmatched card. Add to the match resolution logic in `useGame.ts`:

```typescript
function focusNextUnmatched() {
  if (import.meta.client) {
    nextTick(() => {
      const gridCells = document.querySelectorAll('[role="gridcell"] button:not([disabled])')
      if (gridCells.length > 0) {
        ;(gridCells[0] as HTMLElement).focus()
      }
    })
  }
}

// Call after match resolution (both match and mismatch):
focusNextUnmatched()
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useGame.ts
git commit -m "feat: add screen reader announcements and focus management for match events"
```
