import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  routeRules: {
    '/play/**': { ssr: false },
    '/daily': { ssr: false },
    '/profile': { ssr: false },
    '/leaderboard': { ssr: false },
  },

  // In dev, Vite transforms modules on-demand and the SSR worker runs out of heap
  // on memory-constrained machines. Disable SSR for topic pages in dev only.
  // Production build uses pre-bundled chunks and SSR works fine there (verified).
  $development: {
    routeRules: {
      '/topics/**': { ssr: false },
    },
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

  css: ['~/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  modules: ['@pinia/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],

  vite: {
    plugins: [tailwindcss()],
  },
})
