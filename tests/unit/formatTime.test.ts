import { describe, it, expect } from 'vitest'
import { formatTime } from '~/utils/time'

describe('formatTime', () => {
  it('throws RangeError for negative numbers', () => {
    expect(() => formatTime(-1)).toThrow(RangeError)
    expect(() => formatTime(-60)).toThrow(RangeError)
  })

  it('throws RangeError for NaN', () => {
    expect(() => formatTime(NaN)).toThrow(RangeError)
  })

  it('throws RangeError for Infinity', () => {
    expect(() => formatTime(Infinity)).toThrow(RangeError)
    expect(() => formatTime(-Infinity)).toThrow(RangeError)
  })

  it('floors decimal seconds', () => {
    expect(formatTime(90.7)).toBe('1:30')
    expect(formatTime(59.9)).toBe('0:59')
  })

  it('formats whole seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(90)).toBe('1:30')
    expect(formatTime(3599)).toBe('59:59')
  })

  it('pads single-digit seconds with leading zero', () => {
    expect(formatTime(65)).toBe('1:05')
  })
})
