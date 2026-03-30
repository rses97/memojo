import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  routeRules: {
    '/play/**': { ssr: false },
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
