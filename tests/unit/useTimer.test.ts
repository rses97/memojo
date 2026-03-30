import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useTimer', () => {
  let fakeNow = 0
  const clock = () => fakeNow

  beforeEach(() => {
    fakeNow = 0
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with the given time limit', () => {
    const timer = useTimer(clock)
    timer.init(60)
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
    expect(timer.isExpired.value).toBe(false)
  })

  it('counts down each second when started', () => {
    const timer = useTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 3000
    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(57)
    expect(timer.isRunning.value).toBe(true)
  })

  it('stops at zero and marks as expired', () => {
    const timer = useTimer(clock)
    timer.init(3)
    timer.start()

    fakeNow = 3000
    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(0)
    expect(timer.isExpired.value).toBe(true)
    expect(timer.isRunning.value).toBe(false)
  })

  it('can be paused and resumed', () => {
    const timer = useTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 2000
    vi.advanceTimersByTime(2000)
    expect(timer.remaining.value).toBe(58)

    timer.pause()
    fakeNow = 7000
    vi.advanceTimersByTime(5000)
    expect(timer.remaining.value).toBe(58)

    timer.start()
    fakeNow = 8000
    vi.advanceTimersByTime(1000)
    expect(timer.remaining.value).toBe(57)
  })

  it('resets to initial time', () => {
    const timer = useTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 10000
    vi.advanceTimersByTime(10000)
    expect(timer.remaining.value).toBe(50)

    timer.reset()
    expect(timer.remaining.value).toBe(60)
    expect(timer.isRunning.value).toBe(false)
  })

  it('reports elapsed time', () => {
    const timer = useTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 15000
    vi.advanceTimersByTime(15000)
    expect(timer.elapsed.value).toBe(15)
  })

  it('calls onExpire callback when time runs out', () => {
    const onExpire = vi.fn()
    const timer = useTimer(clock)
    timer.init(2, { onExpire })
    timer.start()

    fakeNow = 2000
    vi.advanceTimersByTime(2000)
    expect(onExpire).toHaveBeenCalledOnce()
  })
})
