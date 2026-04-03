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

  modules: ['@pinia/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],

  vite: {
    plugins: [tailwindcss()],
  },
})
