import { describe, it, expect } from 'vitest'
import { calculateScore } from '~/utils/scoring'

describe('calculateScore', () => {
  it('returns maximum accuracy score for perfect play (one move per pair)', () => {
    const score = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 4,
    })
    // Perfect accuracy (1.0) × 1000 = 1000 base
    // Speed: (1 - 60/120) = 0.5 × 500 = 250
    // Streak: 1 + 4 × 0.1 = 1.4
    // Total: (1000 + 250) × 1.4 = 1750
    expect(score).toBe(1750)
  })

  it('reduces score for extra moves', () => {
    const perfect = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    const imperfect = calculateScore({
      moves: 8,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(imperfect).toBeLessThan(perfect)
  })

  it('rewards faster completion', () => {
    const fast = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 10,
      timeLimit: 120,
      maxStreak: 0,
    })
    const slow = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 100,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(fast).toBeGreaterThan(slow)
  })

  it('applies streak multiplier', () => {
    const noStreak = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 0,
    })
    const withStreak = calculateScore({
      moves: 4,
      totalPairs: 4,
      timeElapsed: 60,
      timeLimit: 120,
      maxStreak: 5,
    })
    expect(withStreak).toBeGreaterThan(noStreak)
  })

  it('never returns a negative score', () => {
    const score = calculateScore({
      moves: 100,
      totalPairs: 4,
      timeElapsed: 120,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('returns zero when time is fully expired and accuracy is zero', () => {
    const score = calculateScore({
      moves: 100,
      totalPairs: 4,
      timeElapsed: 120,
      timeLimit: 120,
      maxStreak: 0,
    })
    expect(score).toBe(0)
  })
})
