# Adaptive Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline header in `default.vue` with a responsive `AppHeader` component that collapses to a hamburger + full-screen overlay on mobile, and update the favicon to a brain emoji SVG.

**Architecture:** Single `AppHeader.vue` component owns all header state (`isOpen` ref). Desktop shows full nav links. Mobile shows hamburger; overlay uses P2 layout — Profile hero card pinned at top, scrollable nav list below. Body scroll lock and Escape key listener managed inside the component.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Tailwind CSS v4, Vitest + `@nuxt/test-utils/runtime` (`mountSuspended`)

---

## File Map

| File                                 | Action | Responsibility                             |
| ------------------------------------ | ------ | ------------------------------------------ |
| `public/favicon.svg`                 | Create | Brain emoji SVG favicon                    |
| `nuxt.config.ts`                     | Modify | Register SVG + ICO favicon links           |
| `tests/components/AppHeader.test.ts` | Create | Component tests (TDD)                      |
| `app/components/AppHeader.vue`       | Create | Responsive header + mobile overlay         |
| `app/layouts/default.vue`            | Modify | Swap inline `<header>` for `<AppHeader />` |

---

## Task 1: Favicon

**Files:**

- Create: `public/favicon.svg`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Create the SVG favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">🧠</text>
</svg>
```

- [ ] **Step 2: Register favicon in nuxt.config.ts**

In `nuxt.config.ts`, add a `link` array to `app.head`:

```ts
app: {
  head: {
    htmlAttrs: { lang: 'en' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },
},
```

- [ ] **Step 3: Verify**

Run `pnpm dev` and open the browser. Confirm the brain emoji appears in the browser tab.

- [ ] **Step 4: Commit**

```bash
git add public/favicon.svg nuxt.config.ts
git commit -m "feat: add brain emoji SVG favicon"
```

---

## Task 2: AppHeader — logo + desktop nav (TDD)

**Files:**

- Create: `tests/components/AppHeader.test.ts`
- Create: `app/components/AppHeader.vue` (skeleton)

- [ ] **Step 1: Write failing tests for logo and desktop nav**

Create `tests/components/AppHeader.test.ts`:

```ts
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '~/components/AppHeader.vue'

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  describe('logo', () => {
    it('renders logo as a link to /', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.exists()).toBe(true)
      expect(logo.attributes('href')).toBe('/')
    })

    it('logo contains the brain emoji', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.text()).toContain('🧠')
    })

    it('logo contains the Memojo wordmark', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.text()).toContain('Memojo')
    })
  })

  describe('desktop nav', () => {
    it('renders desktop nav links', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const nav = wrapper.find('[data-testid="desktop-nav"]')
      expect(nav.exists()).toBe(true)
      expect(nav.text()).toContain('Daily')
      expect(nav.text()).toContain('Topics')
      expect(nav.text()).toContain('Leaderboard')
      expect(nav.text()).toContain('Profile')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/components/AppHeader.test.ts
```

Expected: FAIL — `AppHeader.vue` does not exist.

- [ ] **Step 3: Create AppHeader skeleton with logo + desktop nav**

Create `app/components/AppHeader.vue`:

```vue
<script setup lang="ts">
const isOpen = ref(false)

const navLinks = [
  { to: '/daily', label: 'Daily', emoji: '📅' },
  { to: '/topics', label: 'Topics', emoji: '📚' },
  { to: '/leaderboard', label: 'Leaderboard', emoji: '🏆' },
]

function close() {
  isOpen.value = false
}
</script>

<template>
  <header class="border-b border-surface-200 bg-white dark:bg-surface-800">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <!-- Logo -->
      <NuxtLink
        to="/"
        data-testid="logo"
        class="flex items-center gap-2"
        aria-label="Memojo — Home"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-xl bg-linear-to-br from-primary-600 to-primary-400 text-lg leading-none"
        >
          🧠
        </div>
        <span class="font-bold text-surface-900 dark:text-surface-50">Memojo</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav
        data-testid="desktop-nav"
        class="hidden items-center gap-4 md:flex"
        aria-label="Main navigation"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-surface-700 hover:text-primary-600 dark:text-surface-200 dark:hover:text-primary-400"
          active-class="text-primary-600 dark:text-primary-400"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink
          to="/profile"
          class="text-sm font-medium text-surface-700 hover:text-primary-600 dark:text-surface-200 dark:hover:text-primary-400"
          active-class="text-primary-600 dark:text-primary-400"
        >
          Profile
        </NuxtLink>
        <ThemeToggle />
      </nav>

      <!-- Hamburger (placeholder for Task 3) -->
      <button
        type="button"
        data-testid="hamburger"
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
        class="rounded-lg p-2 text-surface-700 hover:bg-surface-200 dark:text-surface-200 dark:hover:bg-surface-700 md:hidden"
        @click="isOpen = true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </header>
</template>
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/components/AppHeader.test.ts
```

Expected: PASS — all logo and desktop nav tests green.

- [ ] **Step 5: Commit**

```bash
git add tests/components/AppHeader.test.ts app/components/AppHeader.vue
git commit -m "feat: add AppHeader with logo and desktop nav"
```

---

## Task 3: AppHeader — mobile overlay (TDD)

**Files:**

- Modify: `tests/components/AppHeader.test.ts`
- Modify: `app/components/AppHeader.vue`

- [ ] **Step 1: Add failing tests for the mobile overlay**

Append these `describe` blocks inside the existing `describe('AppHeader', ...)` in `tests/components/AppHeader.test.ts`:

```ts
describe('hamburger', () => {
  it('renders hamburger button with accessible label', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const btn = wrapper.find('[data-testid="hamburger"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBe('Open menu')
  })
})

describe('mobile overlay', () => {
  it('overlay is hidden initially', async () => {
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
  })

  it('opens overlay when hamburger is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(true)
  })

  it('overlay has role=dialog and aria-modal', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    const overlay = wrapper.find('[data-testid="nav-overlay"]')
    expect(overlay.attributes('role')).toBe('dialog')
    expect(overlay.attributes('aria-modal')).toBe('true')
  })

  it('close button hides overlay', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    await wrapper.find('[data-testid="close-overlay"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
  })

  it('hamburger aria-label changes to "Close menu" when overlay is open', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(wrapper.find('[data-testid="hamburger"]').attributes('aria-label')).toBe('Close menu')
  })

  it('overlay contains profile hero link to /profile', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    const hero = wrapper.find('[data-testid="profile-hero"]')
    expect(hero.exists()).toBe(true)
    expect(hero.attributes('href')).toBe('/profile')
  })

  it('overlay contains all nav links', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    const links = wrapper.findAll('[data-testid="overlay-nav-link"]')
    expect(links).toHaveLength(3)
  })

  it('clicking a nav link closes the overlay', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    await wrapper.find('[data-testid="overlay-nav-link"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
  })

  it('clicking profile hero closes the overlay', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    await wrapper.find('[data-testid="profile-hero"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
  })

  it('closes overlay on Escape key', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
  })

  it('locks body scroll when overlay opens', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when overlay closes', async () => {
    const wrapper = await mountSuspended(AppHeader)
    await wrapper.find('[data-testid="hamburger"]').trigger('click')
    await wrapper.find('[data-testid="close-overlay"]').trigger('click')
    expect(document.body.style.overflow).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify new ones fail**

```bash
pnpm vitest run tests/components/AppHeader.test.ts
```

Expected: FAIL — overlay-related tests fail (overlay does not exist in DOM yet).

- [ ] **Step 3: Implement the complete AppHeader with overlay**

Replace `app/components/AppHeader.vue` entirely:

```vue
<script setup lang="ts">
const isOpen = ref(false)

const navLinks = [
  { to: '/daily', label: 'Daily', emoji: '📅' },
  { to: '/topics', label: 'Topics', emoji: '📚' },
  { to: '/leaderboard', label: 'Leaderboard', emoji: '🏆' },
]

function close() {
  isOpen.value = false
}

watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="border-b border-surface-200 bg-white dark:bg-surface-800">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <!-- Logo -->
      <NuxtLink
        to="/"
        data-testid="logo"
        class="flex items-center gap-2"
        aria-label="Memojo — Home"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-xl bg-linear-to-br from-primary-600 to-primary-400 text-lg leading-none"
        >
          🧠
        </div>
        <span class="font-bold text-surface-900 dark:text-surface-50">Memojo</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav
        data-testid="desktop-nav"
        class="hidden items-center gap-4 md:flex"
        aria-label="Main navigation"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-surface-700 hover:text-primary-600 dark:text-surface-200 dark:hover:text-primary-400"
          active-class="text-primary-600 dark:text-primary-400"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink
          to="/profile"
          class="text-sm font-medium text-surface-700 hover:text-primary-600 dark:text-surface-200 dark:hover:text-primary-400"
          active-class="text-primary-600 dark:text-primary-400"
        >
          Profile
        </NuxtLink>
        <ThemeToggle />
      </nav>

      <!-- Hamburger -->
      <button
        type="button"
        data-testid="hamburger"
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
        class="rounded-lg p-2 text-surface-700 hover:bg-surface-200 dark:text-surface-200 dark:hover:bg-surface-700 md:hidden"
        @click="isOpen = true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile overlay -->
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        data-testid="nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        class="fixed inset-0 z-50 flex flex-col bg-surface-50 dark:bg-surface-900"
      >
        <!-- Overlay header -->
        <div
          class="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700"
        >
          <NuxtLink
            to="/"
            class="flex items-center gap-2"
            aria-label="Memojo — Home"
            @click="close"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-xl bg-linear-to-br from-primary-600 to-primary-400 text-lg leading-none"
            >
              🧠
            </div>
            <span class="font-bold text-surface-900 dark:text-surface-50">Memojo</span>
          </NuxtLink>
          <div class="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              data-testid="close-overlay"
              aria-label="Close menu"
              class="rounded-lg p-2 text-surface-700 hover:bg-surface-200 dark:text-surface-200 dark:hover:bg-surface-700"
              @click="close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-4 py-4">
          <!-- Profile hero card -->
          <NuxtLink
            to="/profile"
            data-testid="profile-hero"
            class="mb-4 flex items-center gap-4 rounded-card bg-linear-to-r from-primary-600 to-primary-500 px-5 py-4"
            @click="close"
          >
            <span class="text-3xl">👤</span>
            <div class="flex-1">
              <div class="font-bold text-white">Profile</div>
              <div class="text-sm text-primary-100">Your stats &amp; history</div>
            </div>
            <span class="text-xl text-primary-200">›</span>
          </NuxtLink>

          <!-- Nav list -->
          <nav aria-label="Mobile navigation">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              data-testid="overlay-nav-link"
              class="flex items-center gap-4 rounded-lg px-4 py-4 text-surface-900 transition-colors hover:bg-surface-100 dark:text-surface-50 dark:hover:bg-surface-800"
              active-class="text-primary-600 dark:text-primary-400"
              @click="close"
            >
              <span class="text-xl">{{ link.emoji }}</span>
              <span class="font-semibold">{{ link.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>
```

- [ ] **Step 4: Run all AppHeader tests**

```bash
pnpm vitest run tests/components/AppHeader.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add tests/components/AppHeader.test.ts app/components/AppHeader.vue
git commit -m "feat: add mobile overlay to AppHeader"
```

---

## Task 4: Wire AppHeader into default.vue

**Files:**

- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Replace inline header with AppHeader**

In `app/layouts/default.vue`, remove the inline `<header>` block and replace with `<AppHeader />`:

```vue
<script setup lang="ts">
const userStore = useUserStore()

onMounted(() => {
  userStore.initTheme()
})
</script>

<template>
  <div
    class="grid grid-rows-[auto_1fr_auto] min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-900 dark:text-surface-50"
  >
    <SkipToContent />

    <AppHeader />

    <main id="main-content" class="w-full mx-auto max-w-5xl px-4 py-8" tabindex="-1">
      <slot />
    </main>

    <!-- Screen reader announcements -->
    <div id="sr-announcements" aria-live="assertive" aria-atomic="true" class="sr-only" />

    <footer
      class="border-t border-surface-200 px-6 py-4 text-center text-xs text-surface-500 dark:text-surface-400"
    >
      All emojis designed by
      <a
        href="https://openmoji.org/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-surface-700"
        >OpenMoji</a
      >
      – the open-source emoji and icon project. License:
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-surface-700"
        >CC BY-SA 4.0</a
      >
    </footer>
  </div>
</template>
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 3: Manual smoke test**

Run `pnpm dev` and verify:

- Desktop: logo (🧠 + "Memojo") appears on left, nav links + theme toggle on right
- Mobile (resize to < 768px): logo left, hamburger right, nav links hidden
- Tap hamburger: full-screen overlay appears with Profile hero + nav list
- Tap any link: overlay closes, navigation works
- Press Escape: overlay closes
- Theme toggle works in both desktop header and overlay
- Browser tab shows brain emoji favicon

- [ ] **Step 4: Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat: wire AppHeader into default layout"
```
