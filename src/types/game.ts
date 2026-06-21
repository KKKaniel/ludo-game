export type PlayerColor = 'red' | 'blue'

export interface Token {
  id: string        // e.g. 'red-0', 'red-1'
  player: PlayerColor
  index: number     // index in player's token list (0-3)
  // position on the ring: -1 = home base, 0~24 = ring step, 25 = finished
  ringPos: number
  finished: boolean
}

export interface Player {
  color: PlayerColor
  name: string
  // start offset on the ring (red=0, blue=12 for diagonal on 25-cell ring)
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
