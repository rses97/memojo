import { describe, it, expect } from 'vitest'
import { useTopicPractice } from '~/composables/useTopicPractice'
import { LEVELS } from '~/types'
import type { TopicPair } from '~/types'

const testPairs: TopicPair[] = Array.from({ length: 12 }, (_, i) => ({
  id: `pair-${i}`,
  image: `/img/${i}.webp`,
  text: `Item ${i}`,
}))

describe('useTopicPractice', () => {
  it('starts at level 0', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.currentLevelIndex.value).toBe(0)
  })

  it('provides current level config', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.currentLevel.value).toEqual(LEVELS[0])
  })

  it('selects correct number of pairs for current level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.selectedPairs.value).toHaveLength(LEVELS[0].pairs)
  })

  it('advances to next level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.advanceLevel()

    expect(practice.currentLevelIndex.value).toBe(1)
    expect(practice.currentLevel.value).toEqual(LEVELS[1])
    expect(practice.selectedPairs.value).toHaveLength(LEVELS[1].pairs)
  })

  it('reports not complete until all levels finished', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    expect(practice.isAllComplete.value).toBe(false)

    practice.advanceLevel()
    expect(practice.isAllComplete.value).toBe(false)

    practice.advanceLevel()
    expect(practice.isAllComplete.value).toBe(false)
  })

  it('reports complete after advancing past last level', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.advanceLevel() // to level 1
    practice.advanceLevel() // to level 2
    practice.advanceLevel() // past last level

    expect(practice.isAllComplete.value).toBe(true)
  })

  it('tracks total score across levels', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    practice.addLevelScore(500)
    practice.advanceLevel()
    practice.addLevelScore(700)
    practice.advanceLevel()

    expect(practice.totalScore.value).toBe(1200)
  })

  it('provides total level count', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    expect(practice.totalLevels.value).toBe(LEVELS.length)
  })

  it('resets to initial state', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)
    practice.advanceLevel()
    practice.addLevelScore(500)

    practice.reset()

    expect(practice.currentLevelIndex.value).toBe(0)
    expect(practice.totalScore.value).toBe(0)
    expect(practice.isAllComplete.value).toBe(false)
  })

  it('shows between-levels state', () => {
    const practice = useTopicPractice()
    practice.start(testPairs)

    expect(practice.showLevelComplete.value).toBe(false)

    practice.completeLevelAndShow(300)
    expect(practice.showLevelComplete.value).toBe(true)
    expect(practice.lastLevelScore.value).toBe(300)

    practice.advanceLevel()
    expect(practice.showLevelComplete.value).toBe(false)
  })
})
