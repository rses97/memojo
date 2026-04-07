import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
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

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ''
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

  describe('hamburger', () => {
    it('renders hamburger button with accessible label', async () => {
      const wrapper = await mountSuspended(AppHeader)
      const btn = wrapper.find('[data-testid="hamburger"]')
      expect(btn.exists()).toBe(true)
      expect(btn.attributes('aria-label')).toBe('Open menu')
    })
  })

  describe('mobile overlay', () => {
    it('overlay is hidden initially', async () => {
      const wrapper = await mountSuspended(AppHeader)
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
    })

    it('opens overlay when hamburger is clicked', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(true)
    })

    it('overlay has role=dialog and aria-modal', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      const overlay = wrapper.find('[data-testid="nav-overlay"]')
      expect(overlay.attributes('role')).toBe('dialog')
      expect(overlay.attributes('aria-modal')).toBe('true')
    })

    it('close button hides overlay', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      await wrapper.find('[data-testid="close-overlay"]').trigger('click')
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
    })

    it('hamburger aria-label changes to "Close menu" when overlay is open', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      expect(wrapper.find('[data-testid="hamburger"]').attributes('aria-label')).toBe('Close menu')
    })

    it('overlay contains profile hero link to /profile', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      const hero = wrapper.find('[data-testid="profile-hero"]')
      expect(hero.exists()).toBe(true)
      expect(hero.attributes('href')).toBe('/profile')
    })

    it('overlay contains all nav links', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      const links = wrapper.findAll('[data-testid="overlay-nav-link"]')
      expect(links).toHaveLength(3)
    })

    it('clicking a nav link closes the overlay', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      await wrapper.find('[data-testid="overlay-nav-link"]').trigger('click')
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
    })

    it('clicking profile hero closes the overlay', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      await wrapper.find('[data-testid="profile-hero"]').trigger('click')
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
    })

    it('closes overlay on Escape key', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(true)

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await nextTick()

      expect(wrapper.find('[data-testid="nav-overlay"]').exists()).toBe(false)
    })

    it('locks body scroll when overlay opens', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when overlay closes', async () => {
      const wrapper = await mountSuspended(AppHeader)
      await wrapper.find('[data-testid="hamburger"]').trigger('click')
      await wrapper.find('[data-testid="close-overlay"]').trigger('click')
      expect(document.body.style.overflow).toBe('')
    })
  })
})
