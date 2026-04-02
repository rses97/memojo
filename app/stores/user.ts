import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserPreferences } from '~/types'

export const useUserStore = defineStore('user', () => {
  const theme = ref<'light' | 'dark'>('light')
  const preferredTopics = ref<string[]>([])
  const isHydrated = ref(false)

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

  function setTheme(newTheme: 'light' | 'dark') {
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
    preferredTopics,
    isHydrated,
    hydrate,
    setTheme,
    toggleTopic,
  }
})
