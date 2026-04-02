import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type {
  StoredGameResult,
  UserPreferences,
  SpacedRepetitionCard,
  PairPerformance,
  SessionPerformance,
} from '~/types'

interface MemoryGameDB extends DBSchema {
  gameResults: {
    key: string
    value: StoredGameResult
    indexes: {
      'by-topic': string
      'by-mode': string
      'by-date': string
    }
  }
  userPreferences: {
    key: string
    value: UserPreferences
  }
  srCards: {
    key: string
    value: SpacedRepetitionCard
    indexes: {
      'by-topic': string
      'by-nextReview': string
    }
  }
  pairPerformance: {
    key: string
    value: PairPerformance
    indexes: {
      'by-topic': string
    }
  }
  sessionPerformance: {
    key: string
    value: SessionPerformance
    indexes: {
      'by-topic': string
      'by-date': string
    }
  }
}

const DB_NAME = 'memojo'
const DB_VERSION = 1

function getDB() {
  return openDB<MemoryGameDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('gameResults')) {
        const resultsStore = db.createObjectStore('gameResults', {
          keyPath: 'id',
        })
        resultsStore.createIndex('by-topic', 'topic')
        resultsStore.createIndex('by-mode', 'mode')
        resultsStore.createIndex('by-date', 'date')
      }

      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences')
      }

      if (!db.objectStoreNames.contains('srCards')) {
        const srStore = db.createObjectStore('srCards', { keyPath: 'pairId' })
        srStore.createIndex('by-topic', 'topic')
        srStore.createIndex('by-nextReview', 'nextReview')
      }

      if (!db.objectStoreNames.contains('pairPerformance')) {
        const pairStore = db.createObjectStore('pairPerformance', {
          keyPath: 'pairId',
        })
        pairStore.createIndex('by-topic', 'topic')
      }

      if (!db.objectStoreNames.contains('sessionPerformance')) {
        const sessionStore = db.createObjectStore('sessionPerformance', {
          keyPath: 'id',
        })
        sessionStore.createIndex('by-topic', 'topic')
        sessionStore.createIndex('by-date', 'date')
      }
    },
  })
}

export function useIndexedDB() {
  async function putGameResult(result: StoredGameResult) {
    const db = await getDB()
    await db.put('gameResults', result)
  }

  async function getGameResult(id: string) {
    const db = await getDB()
    return db.get('gameResults', id)
  }

  async function getAllGameResults() {
    const db = await getDB()
    return db.getAll('gameResults')
  }

  async function getGameResultsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('gameResults', 'by-topic', topic)
  }

  async function deleteGameResult(id: string) {
    const db = await getDB()
    await db.delete('gameResults', id)
  }

  async function putUserPreferences(prefs: UserPreferences) {
    const db = await getDB()
    await db.put('userPreferences', prefs, 'default')
  }

  async function getUserPreferences() {
    const db = await getDB()
    return db.get('userPreferences', 'default')
  }

  async function putSRCard(card: SpacedRepetitionCard) {
    const db = await getDB()
    await db.put('srCards', card)
  }

  async function getSRCard(pairId: string) {
    const db = await getDB()
    return db.get('srCards', pairId)
  }

  async function getAllSRCards() {
    const db = await getDB()
    return db.getAll('srCards')
  }

  async function getSRCardsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('srCards', 'by-topic', topic)
  }

  async function getSRCardsDueForReview(asOfISO: string) {
    const db = await getDB()
    const range = IDBKeyRange.upperBound(asOfISO)
    return db.getAllFromIndex('srCards', 'by-nextReview', range)
  }

  async function putPairPerformance(perf: PairPerformance) {
    const db = await getDB()
    await db.put('pairPerformance', perf)
  }

  async function getPairPerformance(pairId: string) {
    const db = await getDB()
    return db.get('pairPerformance', pairId)
  }

  async function getPairPerformanceByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('pairPerformance', 'by-topic', topic)
  }

  async function putSessionPerformance(session: SessionPerformance) {
    const db = await getDB()
    await db.put('sessionPerformance', session)
  }

  async function getSessionsByTopic(topic: string) {
    const db = await getDB()
    return db.getAllFromIndex('sessionPerformance', 'by-topic', topic)
  }

  async function getAllSessions() {
    const db = await getDB()
    return db.getAll('sessionPerformance')
  }

  return {
    putGameResult,
    getGameResult,
    getAllGameResults,
    getGameResultsByTopic,
    deleteGameResult,
    putUserPreferences,
    getUserPreferences,
    putSRCard,
    getSRCard,
    getAllSRCards,
    getSRCardsByTopic,
    getSRCardsDueForReview,
    putPairPerformance,
    getPairPerformance,
    getPairPerformanceByTopic,
    putSessionPerformance,
    getSessionsByTopic,
    getAllSessions,
  }
}
