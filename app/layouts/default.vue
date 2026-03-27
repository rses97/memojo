<template>
  <div class="min-h-screen bg-surface-50 text-surface-900">
    <header class="border-b border-surface-200 px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600">
          Memojo
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
