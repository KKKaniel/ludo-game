export type PlayerColor = 'red' | 'blue'

export interface Token {
  id: string
  player: PlayerColor
  index: number
  ringPos: number
  finished: boolean
}

export interface Player {
  color: PlayerColor
  name: string
  startOffset: number
}

export type GamePhase = 'setup' | 'playing' | 'penalty' | 'finished'

export interface PenaltyState {
  absPos: number
  text: string
  level: 'mild' | 'medium' | 'spicy'
}

export interface GameState {
  phase: GamePhase
  players: [Player, Player]
  tokens: Token[]
  currentPlayer: PlayerColor
  diceValue: number | null
  diceRolled: boolean
  winner: PlayerColor | null
  message: string
  penalty: PenaltyState | null
}
