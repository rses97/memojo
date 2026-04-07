<script setup lang="ts">
const isOpen = ref(false)

const navLinks = [
  { to: '/daily', label: 'Daily', emoji: '📅' },
  { to: '/topics', label: 'Topics', emoji: '📚' },
  { to: '/leaderboard', label: 'Leaderboard', emoji: '🏆' },
]

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
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
