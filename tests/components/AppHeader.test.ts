import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '~/components/AppHeader.vue'

describe('AppHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  describe('logo', () => {
    it('renders logo as a link to /', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.exists()).toBe(true)
      expect(logo.attributes('href')).toBe('/')
    })

    it('logo contains the brain emoji', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.text()).toContain('🧠')
    })

    it('logo contains the Memojo wordmark', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const logo = wrapper.find('[data-testid="logo"]')
      expect(logo.text()).toContain('Memojo')
    })
  })

  describe('desktop nav', () => {
    it('renders desktop nav links', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const nav = wrapper.find('[data-testid="desktop-nav"]')
      expect(nav.exists()).toBe(true)
      expect(nav.text()).toContain('Daily')
      expect(nav.text()).toContain('Topics')
      expect(nav.text()).toContain('Leaderboard')
      expect(nav.text()).toContain('Profile')
    })
  })
})
