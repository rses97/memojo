import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useGridNavigation } from '~/composables/useGridNavigation'

describe('useGridNavigation', () => {
  const cols = 4
  const totalCards = 8

  it('moves focus right on ArrowRight', () => {
    const { focusedIndex, handleKeydown } = useGridNavigation(ref(totalCards), ref(cols))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(focusedIndex.value).toBe(1)
  })

  it('moves focus left on ArrowLeft with wrap', () => {
    const { focusedIndex, handleKeydown } = useGridNavigation(ref(totalCards), ref(cols))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(focusedIndex.value).toBe(3)
  })

  it('moves focus down on ArrowDown', () => {
    const { focusedIndex, handleKeydown } = useGridNavigation(ref(totalCards), ref(cols))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(focusedIndex.value).toBe(4)
  })

  it('moves focus up on ArrowUp with wrap', () => {
    const { focusedIndex, handleKeydown } = useGridNavigation(ref(totalCards), ref(cols))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(focusedIndex.value).toBe(4)
  })

  it('does not move past totalCards boundary', () => {
    const { focusedIndex, handleKeydown } = useGridNavigation(ref(6), ref(4))
    focusedIndex.value = 5
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(focusedIndex.value).toBe(5)
  })

  it('prevents default on arrow keys', () => {
    const { handleKeydown } = useGridNavigation(ref(totalCards), ref(cols))
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
    handleKeydown(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
