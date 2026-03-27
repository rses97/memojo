import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameCard from '~/components/game/GameCard.vue'

describe('GameCard', () => {
  const baseProps = {
    card: {
      id: 'a-text',
      pairId: 'a',
      type: 'text' as const,
      content: 'Alpha',
      isFlipped: false,
      isMatched: false,
    },
  }

  it('renders face-down by default', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    expect(wrapper.find('[data-testid="card-back"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="card-front"]').exists()).toBe(true)
    expect(wrapper.classes()).not.toContain('is-flipped')
  })

  it('shows flipped state when isFlipped is true', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isFlipped: true },
      },
    })
    expect(wrapper.classes()).toContain('is-flipped')
  })

  it('shows matched state when isMatched is true', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isMatched: true, isFlipped: true },
      },
    })
    expect(wrapper.classes()).toContain('is-matched')
  })

  it('emits flip event on click', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    await wrapper.trigger('click')
    expect(wrapper.emitted('flip')).toHaveLength(1)
    expect(wrapper.emitted('flip')![0]).toEqual(['a-text'])
  })

  it('displays text content for text type cards', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: { ...baseProps.card, isFlipped: true },
      },
    })
    expect(wrapper.find('[data-testid="card-front"]').text()).toContain('Alpha')
  })

  it('displays image for image type cards', async () => {
    const wrapper = await mountSuspended(GameCard, {
      props: {
        card: {
          ...baseProps.card,
          type: 'image' as const,
          content: '/img/flags/ua.webp',
          isFlipped: true,
        },
      },
    })
    const img = wrapper.find('[data-testid="card-front"] img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/img/flags/ua.webp')
  })

  it('has correct aria-label', async () => {
    const wrapper = await mountSuspended(GameCard, { props: baseProps })
    expect(wrapper.attributes('aria-label')).toContain('card')
  })
})
