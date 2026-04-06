// Tailwind v4 default breakpoints
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

interface ResponsiveGridOptions {
  maxCols: number
  colsMap?: Record<string, number>
}

export function useResponsiveGrid(options: ResponsiveGridOptions) {
  const { maxCols, colsMap = {} } = options
  const containerWidth = ref(0)
  const containerRef = ref<HTMLElement | null>(null)

  const effectiveCols = computed(() => {
    const w = containerWidth.value

    // Apply custom column mapping based on breakpoints
    if (w < BREAKPOINTS.xs && colsMap.xs !== undefined) return Math.min(colsMap.xs, maxCols)
    if (w < BREAKPOINTS.sm && colsMap.sm !== undefined) return Math.min(colsMap.sm, maxCols)
    if (w < BREAKPOINTS.md && colsMap.md !== undefined) return Math.min(colsMap.md, maxCols)
    if (w < BREAKPOINTS.lg && colsMap.lg !== undefined) return Math.min(colsMap.lg, maxCols)
    if (w < BREAKPOINTS.xl && colsMap.xl !== undefined) return Math.min(colsMap.xl, maxCols)
    if (w < BREAKPOINTS['2xl'] && colsMap['2xl'] !== undefined)
      return Math.min(colsMap['2xl'], maxCols)

    return maxCols
  })

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
      }
    })

    resizeObserver.observe(containerRef.value)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })

  return {
    containerRef,
    effectiveCols,
  }
}
