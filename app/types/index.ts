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

export const LEVELS: GameLevel[] = [
  { pairs: 4, gridCols: 4, timeLimit: 120 },
  { pairs: 6, gridCols: 4, timeLimit: 90 },
  { pairs: 9, gridCols: 6, timeLimit: 75, previewTime: 3 },
]
