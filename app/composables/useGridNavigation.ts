export function useGridNavigation(
  totalCards: Ref<number> | ComputedRef<number>,
  gridCols: Ref<number> | ComputedRef<number>,
) {
  const focusedIndex = ref(0)

  function handleKeydown(event: KeyboardEvent) {
    const count = toValue(totalCards)
    const cols = toValue(gridCols)
    const row = Math.floor(focusedIndex.value / cols)
    const col = focusedIndex.value % cols
    const totalRows = Math.ceil(count / cols)
    let newIndex = focusedIndex.value

    switch (event.key) {
      case 'ArrowRight':
        newIndex = row * cols + ((col + 1) % cols)
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowLeft':
        newIndex = row * cols + ((col - 1 + cols) % cols)
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowDown':
        newIndex = ((row + 1) % totalRows) * cols + col
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
      case 'ArrowUp':
        newIndex = ((row - 1 + totalRows) % totalRows) * cols + col
        if (newIndex >= count) newIndex = focusedIndex.value
        event.preventDefault()
        break
    }

    focusedIndex.value = newIndex
  }

  function resetFocus() {
    focusedIndex.value = 0
  }

  return {
    focusedIndex,
    handleKeydown,
    resetFocus,
  }
}
