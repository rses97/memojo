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
    '/daily': { ssr: false },
    '/profile': { ssr: false },
    '/leaderboard': { ssr: false },
    // Topics index is static — prerender at build time so the manifest fetch
    // runs against the local filesystem (not the Vercel CDN-only function bundle).
    // Topic slug pages are interactive game pages; SSR is not needed.
    '/topics': { prerender: true },
    '/topics/**': { ssr: false },
  },

  $development: {
    routeRules: {
      // In dev, override prerender with ssr:false so Vite's SSR worker isn't used
      // (it runs out of heap on memory-constrained machines).
      '/topics': { prerender: false, ssr: false },
    },
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
