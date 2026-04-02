export interface SM2Input {
  easeFactor: number
  interval: number
  repetitions: number
  quality: number // 0-5
}

export interface SM2Output {
  easeFactor: number
  interval: number
  repetitions: number
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { easeFactor, interval, repetitions, quality } = input

  // Adjust ease factor
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const newEaseFactor = Math.max(1.3, easeFactor + efDelta)

  if (quality >= 3) {
    // Correct response
    let newInterval: number
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: repetitions + 1,
    }
  }

  // Failed response
  return {
    easeFactor: newEaseFactor,
    interval: 1,
    repetitions: 0,
  }
}

/**
 * Convert a game match result to an SM-2 quality rating (0-5).
 * - 5: matched on first attempt, fast
 * - 4: matched on first attempt, normal speed
 * - 3: matched on first attempt, slow
 * - 2: matched on second attempt
 * - 1: matched after 3+ attempts
 * - 0: not matched (timed out or gave up)
 */
export function rateMatchQuality(
  attemptsForPair: number,
  matchTimeMs: number,
  averageMatchTimeMs: number,
): number {
  if (attemptsForPair === 0) return 0
  if (attemptsForPair === 1) {
    if (matchTimeMs < averageMatchTimeMs * 0.7) return 5
    if (matchTimeMs < averageMatchTimeMs * 1.3) return 4
    return 3
  }
  if (attemptsForPair === 2) return 2
  return 1
}
