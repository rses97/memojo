import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemeToggle from '~/components/ui/ThemeToggle.vue'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('renders a button with accessible label', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('toggles dark class on document when clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await button.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('displays sun icon in dark mode and moon icon in light mode', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    // Initially light mode — should show moon icon (to switch to dark)
    expect(wrapper.find('[data-testid="icon-moon"]').exists()).toBe(true)

    await wrapper.find('button').trigger('click')

    // Now dark mode — should show sun icon (to switch to light)
    expect(wrapper.find('[data-testid="icon-sun"]').exists()).toBe(true)
  })
})
