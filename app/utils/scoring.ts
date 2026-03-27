export interface ScoreParams {
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
}

export function calculateScore(params: ScoreParams): number {
  const { moves, totalPairs, timeElapsed, timeLimit, maxStreak } = params

  const perfectMoves = totalPairs
  const accuracy = Math.max(0, 1 - (moves - perfectMoves) / (perfectMoves * 2))
  const accuracyScore = accuracy * 1000

  const timeRatio = Math.max(0, 1 - timeElapsed / timeLimit)
  const speedScore = timeRatio * 500

  const streakMultiplier = 1 + maxStreak * 0.1

  return Math.round((accuracyScore + speedScore) * streakMultiplier)
}
