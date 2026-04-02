import { useIndexedDB } from './useIndexedDB'
import { calculateSM2 } from '~/utils/sm2'
import type { SpacedRepetitionCard } from '~/types'

/**
 * Composable for spaced repetition learning using SM-2 algorithm.
 * Accepts an optional clock function for testing (defaults to Date.now()).
 */
export function useSpacedRepetition(clock?: () => number) {
  const db = useIndexedDB()
  const getClock = clock || (() => Date.now())

  function getNow(): Date {
    return new Date(getClock())
  }

  async function getOrCreateCard(
    pairId: string,
    topic: string,
  ): Promise<SpacedRepetitionCard> {
    const existing = await db.getSRCard(pairId, topic)
    if (existing) return existing

    const now = getNow().toISOString()
    const card: SpacedRepetitionCard = {
      pairId,
      topic,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: now,
      lastReview: now,
    }
    await db.putSRCard(card)
    return card
  }

  async function recordReview(
    pairId: string,
    topic: string,
    quality: number,
  ): Promise<SpacedRepetitionCard> {
    const card = await getOrCreateCard(pairId, topic)

    const result = calculateSM2({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      quality,
    })

    const now = getNow()
    const nextReview = new Date(now)
    nextReview.setDate(nextReview.getDate() + result.interval)

    const updated: SpacedRepetitionCard = {
      ...card,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: nextReview.toISOString(),
      lastReview: now.toISOString(),
    }

    await db.putSRCard(updated)
    return updated
  }

  async function getDueCards(topic: string): Promise<SpacedRepetitionCard[]> {
    const now = getNow().toISOString()
    const allDue = await db.getSRCardsDueForReview(now)
    return allDue.filter((card) => card.topic === topic)
  }

  async function selectPairsForSession(
    topic: string,
    allPairIds: string[],
    count: number,
  ): Promise<string[]> {
    const dueCards = await getDueCards(topic)
    const dueIds = dueCards.map((c) => c.pairId)

    // Prioritize due pairs
    const selected: string[] = []

    for (const id of dueIds) {
      if (selected.length >= count) break
      if (allPairIds.includes(id)) {
        selected.push(id)
      }
    }

    // Fill remaining with non-due pairs
    for (const id of allPairIds) {
      if (selected.length >= count) break
      if (!selected.includes(id)) {
        selected.push(id)
      }
    }

    return selected
  }

  return {
    getOrCreateCard,
    recordReview,
    getDueCards,
    selectPairsForSession,
  }
}
