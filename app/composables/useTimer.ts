interface TimerOptions {
  onExpire?: () => void
}

export function useTimer() {
  const remaining = ref(0)
  const isRunning = ref(false)
  const isExpired = ref(false)

  let initialTime = 0
  let intervalId: ReturnType<typeof setInterval> | null = null
  let onExpireCallback: (() => void) | undefined

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
    intervalId = setInterval(() => {
      remaining.value--

      if (remaining.value <= 0) {
        remaining.value = 0
        stop()
        isExpired.value = true
        onExpireCallback?.()
      }
    }, 1000)
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

  onUnmounted(() => {
    stop()
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
