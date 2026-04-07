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
