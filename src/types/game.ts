export type PlayerColor = 'red' | 'blue'

export interface Token {
  id: string
  player: PlayerColor
  index: number
  // -1 = home base
  // 0~24 = outer ring (25 cells)
  // 25~29 = inner path (5 cells toward center)
  // 30 = finished at center
  ringPos: number
  finished: boolean
}

export interface Player {
  color: PlayerColor
  name: string
  startOffset: number
}

export type GamePhase = 'setup' | 'playing' | 'finished'

export interface GameState {
  phase: GamePhase
  players: [Player, Player]
  tokens: Token[]
  currentPlayer: PlayerColor
  diceValue: number | null
  diceRolled: boolean
  winner: PlayerColor | null
  message: string
}
