export interface TopicPair {
  id: string
  image: string
  text: string
  hint?: string
}

export interface TopicPack {
  topic: string
  name: string
  description: string
  pairs: TopicPair[]
}

export interface GameCard {
  id: string
  pairId: string
  type: 'image' | 'text'
  content: string
  isFlipped: boolean
  isMatched: boolean
  isEliminated: boolean
}

export interface GameLevel {
  pairs: number
  gridCols: number
  timeLimit: number
  previewTime?: number
}

export interface GameResult {
  score: number
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
}

export const LEVELS: readonly [GameLevel, GameLevel, GameLevel] = [
  { pairs: 4, gridCols: 4, timeLimit: 120 },
  { pairs: 6, gridCols: 4, timeLimit: 90 },
  { pairs: 9, gridCols: 6, timeLimit: 75, previewTime: 3 },
]

export type GameMode = 'quick-play' | 'daily-challenge' | 'topic-practice'

export interface HintState {
  peekAvailable: number
  eliminateAvailable: number
  peekUsed: number
  eliminateUsed: number
}

export const HINT_COSTS = {
  peek: 200,
  eliminate: 300,
} as const

export const INITIAL_HINTS: HintState = {
  peekAvailable: 1,
  eliminateAvailable: 1,
  peekUsed: 0,
  eliminateUsed: 0,
}

export interface TopicManifestEntry {
  slug: string
  name: string
  description: string
  pairCount: number
}

// --- Persistence types (Plan 3) ---

export interface StoredGameResult {
  id: string
  topic: string
  mode: GameMode
  level: number
  score: number
  moves: number
  totalPairs: number
  timeElapsed: number
  timeLimit: number
  maxStreak: number
  hintsUsed: number
  accuracy: number
  date: string // ISO 8601
}

export interface PairPerformance {
  pairId: string
  topic: string
  attempts: number
  correctMatches: number
  totalTimeMs: number
  lastPlayed: string // ISO 8601
}

export interface SessionPerformance {
  id: string
  topic: string
  mode: GameMode
  level: number
  accuracy: number
  averageMatchTimeMs: number
  maxStreak: number
  date: string // ISO 8601
}

export interface SpacedRepetitionCard {
  pairId: string
  topic: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string // ISO 8601
  lastReview: string // ISO 8601
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  preferredTopics: string[]
}

export interface AdaptiveLevelAdjustment {
  pairs: number
  gridCols: number
  timeLimit: number
  previewTime?: number
}
