<script setup lang="ts">
useHead({
  title: 'Memojo — Cross-Modal Memory Training',
})
</script>

<template>
  <div class="flex flex-col items-center gap-8 py-12 text-center">
    <h1 class="text-5xl font-bold tracking-tight">
      Memo<span class="text-primary-500">jo</span>
    </h1>
    <p class="max-w-md text-lg text-surface-700">
      Match images to words. Train your memory with cross-modal matching across
      diverse topics.
    </p>

    <div class="flex flex-col gap-4">
      <NuxtLink
        to="/play/world-flags"
        class="rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-600 hover:shadow-xl"
      >
        Quick Play
      </NuxtLink>
    </div>
  </div>
</template>
