import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameLevelComplete from '~/components/game/GameLevelComplete.vue'

describe('GameLevelComplete', () => {
  const baseProps = {
    levelIndex: 0,
    totalLevels: 3,
    score: 320,
    isLastLevel: false,
  }

  it('renders level title and score', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.text()).toContain('Level 1 Complete!')
    expect(wrapper.text()).toContain('320')
  })

  it('shows "Level X of Y" badge', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.text()).toContain('Level 1 of 3')
  })

  it('renders correct number of progress pips', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.findAll('[data-testid="progress-pip"]')).toHaveLength(3)
  })

  it('marks completed levels as done', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    const pips = wrapper.findAll('[data-testid="progress-pip"]')
    expect(pips[0]!.classes()).toContain('pip--done')
    expect(pips[1]!.classes()).not.toContain('pip--done')
    expect(pips[2]!.classes()).not.toContain('pip--done')
  })

  it('shows "Next Level" button when not last level', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.find('button').text()).toContain('Next Level')
  })

  it('shows "View Results" button on last level', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, {
      props: { ...baseProps, isLastLevel: true },
    })
    expect(wrapper.find('button').text()).toContain('View Results')
  })

  it('emits next when button clicked', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('applies fixed positioning class', async () => {
    const wrapper = await mountSuspended(GameLevelComplete, { props: baseProps })
    expect(wrapper.classes()).toContain('fixed')
  })
})
