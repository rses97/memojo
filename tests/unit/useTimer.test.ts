import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mounts useTimer inside a real component so onMounted/onUnmounted fire correctly
function withTimer(clockFn: () => number) {
  let result: ReturnType<typeof useTimer>
  const wrapper = mount(defineComponent({
    setup() {
      result = useTimer(clockFn)
      return () => h('div')
    },
  }))
  return { timer: result!, wrapper }
}

describe('useTimer', () => {
  let fakeNow = 0
  const clock = () => fakeNow

  beforeEach(() => {
    fakeNow = 0
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
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

  it('auto-pauses when tab becomes hidden and resumes when visible again', () => {
    const { timer, wrapper } = withTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 5000
    vi.advanceTimersByTime(5000)
    expect(timer.remaining.value).toBe(55)

    // tab hidden
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(timer.isRunning.value).toBe(false)

    // time passes while hidden — should not count
    fakeNow = 15000
    vi.advanceTimersByTime(10000)
    expect(timer.remaining.value).toBe(55)

    // tab visible again
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(timer.isRunning.value).toBe(true)

    fakeNow = 16000
    vi.advanceTimersByTime(1000)
    expect(timer.remaining.value).toBe(54)

    wrapper.unmount()
  })

  it('does not auto-resume if timer was manually paused before tab hide', () => {
    const { timer, wrapper } = withTimer(clock)
    timer.init(60)
    timer.start()

    fakeNow = 5000
    vi.advanceTimersByTime(5000)

    // user manually pauses
    timer.pause()
    expect(timer.isRunning.value).toBe(false)

    // tab hides then shows — should not restart a manually-paused timer
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(timer.isRunning.value).toBe(false)
    expect(timer.remaining.value).toBe(55)

    wrapper.unmount()
  })
})
