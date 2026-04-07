import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameResultModal from '~/components/game/GameResultModal.vue'

describe('GameResultModal', () => {
  const baseProps = {
    title: 'Challenge Complete!',
    emoji: '🎉',
    score: 480,
    stats: '5 / 5 pairs matched in 12 moves',
  }

  it('renders emoji, title, score, and stats', async () => {
    const wrapper = await mountSuspended(GameResultModal, { props: baseProps })
    expect(wrapper.text()).toContain('🎉')
    expect(wrapper.text()).toContain('Challenge Complete!')
    expect(wrapper.text()).toContain('480')
    expect(wrapper.text()).toContain('5 / 5 pairs matched in 12 moves')
  })

  it('renders slotted actions', async () => {
    const wrapper = await mountSuspended(GameResultModal, {
      props: baseProps,
      slots: { actions: '<button>Back to Menu</button>' },
    })
    expect(wrapper.text()).toContain('Back to Menu')
  })

  it('applies fixed positioning class', async () => {
    const wrapper = await mountSuspended(GameResultModal, { props: baseProps })
    expect(wrapper.classes()).toContain('fixed')
  })
})
