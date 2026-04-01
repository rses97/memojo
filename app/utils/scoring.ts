import { HINT_COSTS } from '~/types'

export interface ScoreParams {
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
  hintsUsed?: { peek: number; eliminate: number }
}

export function calculateScore(params: ScoreParams): number {
  const { moves, totalPairs, timeElapsed, timeLimit, maxStreak, hintsUsed } =
    params

  const perfectMoves = totalPairs
  const accuracy = Math.max(0, 1 - (moves - perfectMoves) / (perfectMoves * 2))
  const accuracyScore = accuracy * 1000

  const timeRatio = Math.max(0, 1 - timeElapsed / timeLimit)
  const speedScore = timeRatio * 500

  const streakMultiplier = 1 + maxStreak * 0.1

  let total = Math.round((accuracyScore + speedScore) * streakMultiplier)

  if (hintsUsed) {
    const peekUsed = Math.max(0, hintsUsed.peek)
    const eliminateUsed = Math.max(0, hintsUsed.eliminate)
    total -= peekUsed * HINT_COSTS.peek
    total -= eliminateUsed * HINT_COSTS.eliminate
  }

  return Math.max(0, total)
}
