<template>
  <div class="flex min-h-screen flex-col bg-surface-50 text-surface-900">
    <header class="border-b border-surface-200 px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary-600">
          Memojo
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      <slot />
    </main>
    <footer class="border-t border-surface-200 px-6 py-4 text-center text-xs text-surface-500">
      Emoji graphics by
      <a
        href="https://openmoji.org/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-surface-700"
      >OpenMoji</a>
      — CC BY-SA 4.0
    </footer>
  </div>
</template>
