import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { UserPreferences } from '~/types'

export const useUserStore = defineStore('user', () => {
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const preferredTopics = ref<string[]>([])
  const isHydrated = ref(false)
  const prefersDark = ref(false)

  let themeInitialized = false

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value !== 'system') return theme.value
    return prefersDark.value ? 'dark' : 'light'
  })

  function toggleTheme() {
    if (resolvedTheme.value === 'dark') {
      theme.value = 'light'
    } else {
      theme.value = 'dark'
    }
  }

  function initTheme() {
    if (!import.meta.client) return
    const applyTheme = () => {
      if (resolvedTheme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    prefersDark.value = mq.matches
    mq.addEventListener('change', (e) => {
      prefersDark.value = e.matches
    })
    applyTheme()
    if (!themeInitialized) {
      themeInitialized = true
      watch(resolvedTheme, applyTheme)
    }
  }

  async function hydrate() {
    if (import.meta.server) return

    const { useIndexedDB } = await import('~/composables/useIndexedDB')
    const db = useIndexedDB()
    const stored = await db.getUserPreferences()

    if (stored) {
      theme.value = stored.theme
      preferredTopics.value = stored.preferredTopics
    }

    isHydrated.value = true
  }

  async function persist() {
    if (import.meta.server) return

    const { useIndexedDB } = await import('~/composables/useIndexedDB')
    const db = useIndexedDB()
    await db.putUserPreferences({
      theme: theme.value,
      preferredTopics: preferredTopics.value,
    })
  }

  function setTheme(newTheme: 'light' | 'dark' | 'system') {
    theme.value = newTheme
    persist()
  }

  function toggleTopic(topicSlug: string) {
    const index = preferredTopics.value.indexOf(topicSlug)
    if (index >= 0) {
      preferredTopics.value.splice(index, 1)
    } else {
      preferredTopics.value.push(topicSlug)
    }
    persist()
  }

  return {
    theme,
    resolvedTheme,
    preferredTopics,
    isHydrated,
    hydrate,
    persist,
    setTheme,
    toggleTheme,
    initTheme,
    toggleTopic,
  }
})
