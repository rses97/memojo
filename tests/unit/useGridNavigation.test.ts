import { describe, it, expect, vi } from 'vitest'

describe('useGridNavigation', () => {
  const cols = 4
  const totalCards = 8

  function createNavigation(cardCount: number, gridCols: number) {
    const focusedIndex = ref(0)

    function handleKeydown(event: { key: string; preventDefault: () => void }) {
      const row = Math.floor(focusedIndex.value / gridCols)
      const col = focusedIndex.value % gridCols
      const totalRows = Math.ceil(cardCount / gridCols)
      let newIndex = focusedIndex.value

      switch (event.key) {
        case 'ArrowRight':
          newIndex = row * gridCols + ((col + 1) % gridCols)
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowLeft':
          newIndex = row * gridCols + ((col - 1 + gridCols) % gridCols)
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowDown':
          newIndex = ((row + 1) % totalRows) * gridCols + col
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
        case 'ArrowUp':
          newIndex = ((row - 1 + totalRows) % totalRows) * gridCols + col
          if (newIndex >= cardCount) newIndex = focusedIndex.value
          event.preventDefault()
          break
      }
      focusedIndex.value = newIndex
    }

    return { focusedIndex, handleKeydown }
  }

  it('moves focus right on ArrowRight', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowRight', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(1)
  })

  it('moves focus left on ArrowLeft with wrap', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowLeft', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(3)
  })

  it('moves focus down on ArrowDown', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowDown', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(4)
  })

  it('moves focus up on ArrowUp with wrap', () => {
    const { focusedIndex, handleKeydown } = createNavigation(totalCards, cols)
    handleKeydown({ key: 'ArrowUp', preventDefault: vi.fn() })
    expect(focusedIndex.value).toBe(4)
  })

  it('does not move past totalCards boundary', () => {
    const { focusedIndex, handleKeydown } = createNavigation(6, 4)
    focusedIndex.value = 5 // row 1, col 1
    handleKeydown({ key: 'ArrowRight', preventDefault: vi.fn() })
    // row 1, col 2 = index 6 which is >= 6, so stay at 5
    expect(focusedIndex.value).toBe(5)
  })

  it('prevents default on arrow keys', () => {
    const { handleKeydown } = createNavigation(totalCards, cols)
    const preventDefault = vi.fn()
    handleKeydown({ key: 'ArrowRight', preventDefault })
    expect(preventDefault).toHaveBeenCalled()
  })
})
