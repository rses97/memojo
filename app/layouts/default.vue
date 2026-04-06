<script setup lang="ts">
const userStore = useUserStore()

onMounted(() => {
  userStore.initTheme()
})
</script>

<template>
  <div
    class="grid grid-rows-[auto_1fr_auto] min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-900"
  >
    <SkipToContent />

    <header class="border-b border-surface-200 bg-white dark:bg-surface-800">
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
