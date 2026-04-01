import { describe, it, expect } from 'vitest'
import { dateSeed, seededShuffle } from '~/utils/seededRandom'

describe('dateSeed', () => {
  it('returns a deterministic integer for a given date', () => {
    const seed = dateSeed(new Date('2026-03-26'))
    expect(seed).toBe(20260326)
  })

  it('returns different seeds for different dates', () => {
    const seed1 = dateSeed(new Date('2026-03-26'))
    const seed2 = dateSeed(new Date('2026-03-27'))
    expect(seed1).not.toBe(seed2)
  })

  it('returns the same seed regardless of time-of-day', () => {
    const morning = dateSeed(new Date('2026-03-26T08:00:00Z'))
    const evening = dateSeed(new Date('2026-03-26T22:30:00Z'))
    expect(morning).toBe(evening)
  })
})

describe('seededShuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = seededShuffle(input, 42)
    expect(result).toHaveLength(5)
  })

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = seededShuffle(input, 42)
    expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    seededShuffle(input, 42)
    expect(input).toEqual(copy)
  })

  it('produces the same output for the same seed', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const result1 = seededShuffle(input, 12345)
    const result2 = seededShuffle(input, 12345)
    expect(result1).toEqual(result2)
  })

  it('produces different output for different seeds', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const result1 = seededShuffle(input, 12345)
    const result2 = seededShuffle(input, 54321)
    expect(result1).not.toEqual(result2)
  })

  it('handles empty array', () => {
    expect(seededShuffle([], 42)).toEqual([])
  })

  it('handles single-element array', () => {
    expect(seededShuffle([1], 42)).toEqual([1])
  })
})
