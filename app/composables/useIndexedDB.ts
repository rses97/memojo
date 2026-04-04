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
    key: [string, string]
    value: SpacedRepetitionCard
    indexes: {
      'by-topic': string
      'by-nextReview': string
    }
  }
  pairPerformance: {
    key: [string, string]
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
const DB_VERSION = 2

function getDB() {
  if (import.meta.server) {
    throw new Error('IndexedDB is not available on the server')
  }
  return openDB<MemoryGameDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const resultsStore = db.createObjectStore('gameResults', {
          keyPath: 'id',
        })
        resultsStore.createIndex('by-topic', 'topic')
        resultsStore.createIndex('by-mode', 'mode')
        resultsStore.createIndex('by-date', 'date')

        db.createObjectStore('userPreferences')

        const sessionStore = db.createObjectStore('sessionPerformance', {
          keyPath: 'id',
        })
        sessionStore.createIndex('by-topic', 'topic')
        sessionStore.createIndex('by-date', 'date')
      }

      if (oldVersion < 2) {
        // Recreate srCards and pairPerformance with compound ['pairId', 'topic'] key
        // to prevent collisions when the same pairId appears in different topics
        if (db.objectStoreNames.contains('srCards')) {
          db.deleteObjectStore('srCards')
        }
        const srStore = db.createObjectStore('srCards', {
          keyPath: ['pairId', 'topic'],
        })
        srStore.createIndex('by-topic', 'topic')
        srStore.createIndex('by-nextReview', 'nextReview')

        if (db.objectStoreNames.contains('pairPerformance')) {
          db.deleteObjectStore('pairPerformance')
        }
        const pairStore = db.createObjectStore('pairPerformance', {
          keyPath: ['pairId', 'topic'],
        })
        pairStore.createIndex('by-topic', 'topic')
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

  async function getSRCard(pairId: string, topic: string) {
    const db = await getDB()
    return db.get('srCards', [pairId, topic])
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

  async function getPairPerformance(pairId: string, topic: string) {
    const db = await getDB()
    return db.get('pairPerformance', [pairId, topic])
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
