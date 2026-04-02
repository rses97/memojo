import { useIndexedDB } from './useIndexedDB'
import { LEVELS } from '~/types'
import type { AdaptiveLevelAdjustment } from '~/types'

const HIGH_ACCURACY_THRESHOLD = 0.85
const LOW_ACCURACY_THRESHOLD = 0.6
const CONSECUTIVE_SESSIONS_FOR_INCREASE = 3
const WEAK_PAIR_ACCURACY_THRESHOLD = 0.5
const STRONG_PAIR_ACCURACY_THRESHOLD = 0.8
const MIN_PAIRS = 2
const TIME_ADJUSTMENT_SECONDS = 15
const PREVIEW_TIME_SECONDS = 3

export function useAdaptive() {
  const db = useIndexedDB()

  async function getAdjustedLevel(
    topic: string,
    levelIndex: number,
  ): Promise<AdaptiveLevelAdjustment> {
    const base = LEVELS[levelIndex] ?? LEVELS[0]
    const sessions = await db.getSessionsByTopic(topic)
    const levelSessions = sessions
      .filter((s) => s.level === levelIndex)
      .sort((a, b) => b.date.localeCompare(a.date))

    if (levelSessions.length === 0) {
      return {
        pairs: base.pairs,
        gridCols: base.gridCols,
        timeLimit: base.timeLimit,
        previewTime: base.previewTime,
      }
    }

    // Check for consecutive high accuracy (increase difficulty)
    const recentSessions = levelSessions.slice(0, CONSECUTIVE_SESSIONS_FOR_INCREASE)
    const allHighAccuracy =
      recentSessions.length >= CONSECUTIVE_SESSIONS_FOR_INCREASE &&
      recentSessions.every((s) => s.accuracy > HIGH_ACCURACY_THRESHOLD)

    if (allHighAccuracy) {
      return {
        pairs: base.pairs + 2,
        gridCols: base.gridCols + 2,
        timeLimit: Math.max(30, base.timeLimit - TIME_ADJUSTMENT_SECONDS),
        previewTime: base.previewTime,
      }
    }

    // Check for low accuracy (decrease difficulty)
    const lastSession = levelSessions[0]
    if (lastSession.accuracy < LOW_ACCURACY_THRESHOLD) {
      return {
        pairs: Math.max(MIN_PAIRS, base.pairs - 2),
        gridCols: Math.max(2, base.gridCols - 2),
        timeLimit: base.timeLimit + TIME_ADJUSTMENT_SECONDS,
        previewTime: PREVIEW_TIME_SECONDS,
      }
    }

    // No adjustment needed
    return {
      pairs: base.pairs,
      gridCols: base.gridCols,
      timeLimit: base.timeLimit,
      previewTime: base.previewTime,
    }
  }

  async function categorizePairs(topic: string): Promise<{ weak: string[]; strong: string[] }> {
    const performances = await db.getPairPerformanceByTopic(topic)

    const weak: string[] = []
    const strong: string[] = []

    for (const perf of performances) {
      const accuracy = perf.attempts > 0 ? perf.correctMatches / perf.attempts : 0
      if (accuracy < WEAK_PAIR_ACCURACY_THRESHOLD) {
        weak.push(perf.pairId)
      } else if (accuracy >= STRONG_PAIR_ACCURACY_THRESHOLD) {
        strong.push(perf.pairId)
      }
    }

    return { weak, strong }
  }

  async function buildMixedSession(
    topic: string,
    allPairIds: string[],
    count: number,
  ): Promise<string[]> {
    const { weak, strong } = await categorizePairs(topic)

    const selected: string[] = []

    // 1. Add all weak pairs first (they need practice)
    for (const id of weak) {
      if (selected.length >= count) break
      if (allPairIds.includes(id)) {
        selected.push(id)
      }
    }

    // 2. Fill with unseen/neutral pairs (not strong)
    const neutral = allPairIds.filter((id) => !selected.includes(id) && !strong.includes(id))
    for (const id of neutral) {
      if (selected.length >= count) break
      selected.push(id)
    }

    // 3. Fill remaining with strong pairs if needed
    for (const id of strong) {
      if (selected.length >= count) break
      if (allPairIds.includes(id) && !selected.includes(id)) {
        selected.push(id)
      }
    }

    return selected
  }

  return {
    getAdjustedLevel,
    categorizePairs,
    buildMixedSession,
  }
}
