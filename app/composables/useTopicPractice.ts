import { LEVELS } from '~/types'
import type { TopicPair } from '~/types'

export function useTopicPractice() {
  const allPairs = ref<TopicPair[]>([])
  const currentLevelIndex = ref(0)
  const totalScore = ref(0)
  const showLevelComplete = ref(false)
  const lastLevelScore = ref(0)

  const availableLevels = computed(() =>
    LEVELS.filter((level) => allPairs.value.length >= level.pairs),
  )

  const currentLevel = computed(
    () => availableLevels.value[currentLevelIndex.value],
  )

  const isAllComplete = computed(
    () => currentLevelIndex.value >= availableLevels.value.length,
  )

  const totalLevels = computed(() => availableLevels.value.length)

  const selectedPairs = computed(() => {
    if (isAllComplete.value || !currentLevel.value) return []
    return allPairs.value.slice(0, currentLevel.value.pairs)
  })

  function start(pairs: TopicPair[]) {
    allPairs.value = [...pairs]
    currentLevelIndex.value = 0
    totalScore.value = 0
    showLevelComplete.value = false
    lastLevelScore.value = 0
    if (availableLevels.value.length === 0) {
      throw new Error('Topic has too few pairs for any level')
    }
  }

  function advanceLevel() {
    showLevelComplete.value = false
    currentLevelIndex.value++
  }

  function addLevelScore(score: number) {
    totalScore.value += score
  }

  function completeLevelAndShow(score: number) {
    lastLevelScore.value = score
    addLevelScore(score)
    showLevelComplete.value = true
  }

  function reset() {
    currentLevelIndex.value = 0
    totalScore.value = 0
    showLevelComplete.value = false
    lastLevelScore.value = 0
  }

  return {
    currentLevelIndex: readonly(currentLevelIndex),
    currentLevel,
    selectedPairs,
    isAllComplete,
    totalLevels,
    totalScore: readonly(totalScore),
    showLevelComplete: readonly(showLevelComplete),
    lastLevelScore: readonly(lastLevelScore),
    start,
    advanceLevel,
    addLevelScore,
    completeLevelAndShow,
    reset,
  }
}
