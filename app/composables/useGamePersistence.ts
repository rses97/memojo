import { useIndexedDB } from './useIndexedDB'
import { useSpacedRepetition } from './useSpacedRepetition'
import type {
  GameResult,
  GameMode,
  StoredGameResult,
  SessionPerformance,
  PairPerformance,
} from '~/types'
import { rateMatchQuality } from '~/utils/sm2'

interface SaveGameOptions {
  result: GameResult
  topic: string
  mode: GameMode
  level: number
  hintsUsed: number
  pairAttempts: Map<
    string,
    { attempts: number; timeMs: number; matched: boolean }
  >
}

export function useGamePersistence() {
  const db = useIndexedDB()
  const sr = useSpacedRepetition()

  async function saveGameResult(options: SaveGameOptions) {
    const { result, topic, mode, level, hintsUsed, pairAttempts } = options
    const now = new Date().toISOString()
    const id = `${topic}-${mode}-${Date.now()}`

    const perfectMoves = result.totalPairs
    const accuracy =
      result.totalPairs > 0
        ? Math.max(0, 1 - (result.moves - perfectMoves) / (perfectMoves * 2))
        : 0

    // 1. Store game result
    const storedResult: StoredGameResult = {
      id,
      topic,
      mode,
      level,
      score: result.score,
      moves: result.moves,
      totalPairs: result.totalPairs,
      timeElapsed: result.timeElapsed,
      timeLimit: result.timeLimit,
      maxStreak: result.maxStreak,
      hintsUsed,
      accuracy: Math.min(1, accuracy),
      date: now,
    }
    await db.putGameResult(storedResult)

    // 2. Store session performance
    const totalTimeMs = Array.from(pairAttempts.values()).reduce(
      (sum, p) => sum + p.timeMs,
      0,
    )
    const matchedPairs = Array.from(pairAttempts.values()).filter(
      (p) => p.matched,
    )
    const avgMatchTime =
      matchedPairs.length > 0 ? totalTimeMs / matchedPairs.length : 0

    const session: SessionPerformance = {
      id: `session-${id}`,
      topic,
      mode,
      level,
      accuracy: storedResult.accuracy,
      averageMatchTimeMs: avgMatchTime,
      maxStreak: result.maxStreak,
      date: now,
    }
    await db.putSessionPerformance(session)

    // 3. Update pair performance and spaced repetition
    for (const [pairId, data] of pairAttempts) {
      // Update pair performance
      const existing = await db.getPairPerformance(pairId, topic)
      const updated: PairPerformance = {
        pairId,
        topic,
        attempts: (existing?.attempts ?? 0) + data.attempts,
        correctMatches:
          (existing?.correctMatches ?? 0) + (data.matched ? 1 : 0),
        totalTimeMs: (existing?.totalTimeMs ?? 0) + data.timeMs,
        lastPlayed: now,
      }
      await db.putPairPerformance(updated)

      // Update spaced repetition
      const quality = rateMatchQuality(
        data.matched ? data.attempts : 0,
        data.timeMs,
        avgMatchTime,
      )
      await sr.recordReview(pairId, topic, quality)
    }

    return storedResult
  }

  return { saveGameResult }
}
