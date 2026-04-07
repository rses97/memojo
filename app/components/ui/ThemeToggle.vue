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
    class="rounded-lg p-2 text-surface-700 dark:text-surface-200 transition-colors hover:bg-surface-200 dark:hover:text-surface-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
