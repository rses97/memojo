import { describe, it, expect } from 'vitest'
import {
  calculateSM2,
  type SM2Input,
  type SM2Output,
} from '../../app/utils/sm2'

describe('calculateSM2', () => {
  const defaultInput: SM2Input = {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    quality: 4,
  }

  it('first correct review sets interval to 1', () => {
    const result = calculateSM2({ ...defaultInput, quality: 4 })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('second correct review sets interval to 6', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      quality: 4,
    })
    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
  })

  it('third correct review uses easeFactor multiplier', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      quality: 4,
    })
    expect(result.interval).toBe(15) // Math.round(6 * 2.5)
    expect(result.repetitions).toBe(3)
  })

  it('failed review resets repetitions and interval', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 15,
      repetitions: 3,
      quality: 2,
    })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('adjusts ease factor upward for quality 5', () => {
    const result = calculateSM2({ ...defaultInput, quality: 5 })
    // EF' = 2.5 + (0.1 - (5-5)*(0.08 + (5-5)*0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBeCloseTo(2.6, 2)
  })

  it('adjusts ease factor downward for quality 3', () => {
    const result = calculateSM2({ ...defaultInput, quality: 3 })
    // EF' = 2.5 + (0.1 - (5-3)*(0.08 + (5-3)*0.02)) = 2.5 + (0.1 - 2*0.12) = 2.5 - 0.14 = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 2)
  })

  it('clamps ease factor to minimum 1.3', () => {
    const result = calculateSM2({
      easeFactor: 1.3,
      interval: 1,
      repetitions: 0,
      quality: 0,
    })
    // EF would go below 1.3, so clamp
    expect(result.easeFactor).toBe(1.3)
  })

  it('quality 0 (total failure) resets and adjusts EF', () => {
    const result = calculateSM2({
      easeFactor: 2.5,
      interval: 10,
      repetitions: 5,
      quality: 0,
    })
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
    // EF' = 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 + (0.1 - 5*0.18) = 2.5 - 0.8 = 1.7
    expect(result.easeFactor).toBeCloseTo(1.7, 2)
  })
})
