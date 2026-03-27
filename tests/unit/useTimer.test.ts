import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with the given time limit', () => {
    const timer = useTimer()
    timer.init(60)
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
    expect(timer.isExpired.value).toBe(false)
  })

  it('counts down each second when started', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(57)
    expect(timer.isRunning.value).toBe(true)
  })

  it('stops at zero and marks as expired', () => {
    const timer = useTimer()
    timer.init(3)
    timer.start()

    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(0)
    expect(timer.isExpired.value).toBe(true)
    expect(timer.isRunning.value).toBe(false)
  })

  it('can be paused and resumed', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(2000)
    expect(timer.remaining.value).toBe(58)

    timer.pause()
    vi.advanceTimersByTime(5000)
    expect(timer.remaining.value).toBe(58)

    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.remaining.value).toBe(57)
  })

  it('resets to initial time', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(10000)
    expect(timer.remaining.value).toBe(50)

    timer.reset()
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
  })

  it('reports elapsed time', () => {
    const timer = useTimer()
    timer.init(60)
    timer.start()

    vi.advanceTimersByTime(15000)
    expect(timer.elapsed.value).toBe(15)
  })

  it('calls onExpire callback when time runs out', () => {
    const onExpire = vi.fn()
    const timer = useTimer()
    timer.init(2, { onExpire })
    timer.start()

    vi.advanceTimersByTime(2000)
    expect(onExpire).toHaveBeenCalledOnce()
  })
})
