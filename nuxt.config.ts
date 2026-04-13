import tailwindcss from '@tailwindcss/vite'
import { version } from './package.json'

export default defineNuxtConfig({
  appConfig: {
    version,
  },
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  routeRules: {
    '/topics': { swr: true },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
