interface TimerOptions {
  onExpire?: () => void
}

// clock is injectable for testing — avoids relying on vi.useFakeTimers() faking performance.now()
export function useTimer(clock: () => number = () => performance.now()) {
  const remaining = ref(0)
  const isRunning = ref(false)
  const isExpired = ref(false)

  let initialTime = 0
  let startedAt = 0
  let startRemaining = 0
  let intervalId: ReturnType<typeof setInterval> | null = null
  let onExpireCallback: (() => void) | undefined
  let pausedByVisibility = false

  const elapsed = computed(() => initialTime - remaining.value)

  function init(seconds: number, options?: TimerOptions) {
    stop()
    initialTime = seconds
    remaining.value = seconds
    isRunning.value = false
    isExpired.value = false
    onExpireCallback = options?.onExpire
  }

  function start() {
    if (isRunning.value || isExpired.value) return

    isRunning.value = true
    startedAt = clock()
    startRemaining = remaining.value

    intervalId = setInterval(() => {
      const secondsElapsed = Math.floor((clock() - startedAt) / 1000)
      remaining.value = Math.max(0, startRemaining - secondsElapsed)

      if (remaining.value <= 0) {
        stop()
        isExpired.value = true
        onExpireCallback?.()
      }
    }, 250)
  }

  function pause() {
    stop()
  }

  function reset() {
    stop()
    remaining.value = initialTime
    isExpired.value = false
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  // client-only: uses document.visibilityState — only ever called via addEventListener registered in onMounted
  function handleVisibilityChange() {
    if (document.hidden) {
      if (isRunning.value) {
        pause()
        pausedByVisibility = true
      }
    }
    else if (pausedByVisibility) {
      pausedByVisibility = false
      start()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stop()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    remaining: readonly(remaining),
    elapsed,
    isRunning: readonly(isRunning),
    isExpired: readonly(isExpired),
    init,
    start,
    pause,
    reset,
  }
}
