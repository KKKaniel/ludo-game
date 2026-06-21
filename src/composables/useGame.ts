import { reactive, computed } from 'vue'
import type { GameState, Token, PlayerColor } from '../types/game'

const RING_SIZE = 25
const TOKENS_PER_PLAYER = 4
// blue starts at the diagonally opposite cell
const BLUE_START_OFFSET = 12

function createInitialState(redName: string, blueName: string): GameState {
  const tokens: Token[] = []
  for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
    tokens.push({ id: `red-${i}`, player: 'red', index: i, ringPos: -1, finished: false })
  }
  for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
    tokens.push({ id: `blue-${i}`, player: 'blue', index: i, ringPos: -1, finished: false })
  }
  return {
    phase: 'playing',
    players: [
      { color: 'red', name: redName || '玩家一', startOffset: 0 },
      { color: 'blue', name: blueName || '玩家二', startOffset: BLUE_START_OFFSET },
    ],
    tokens,
    currentPlayer: 'red',
    diceValue: null,
    diceRolled: false,
    winner: null,
    message: '红方掷骰子',
  }
}

export function useGame() {
  const state = reactive<GameState>(createInitialState('玩家一', '玩家二'))

  // absolute ring position for a token (accounts for player start offset)
  function absolutePos(token: Token): number {
    const offset = token.player === 'red' ? 0 : BLUE_START_OFFSET
    return (offset + token.ringPos) % RING_SIZE
  }

  const currentTokens = computed(() =>
    state.tokens.filter(t => t.player === state.currentPlayer)
  )

  function rollDice() {
    if (state.diceRolled || state.phase !== 'playing') return
    const val = Math.floor(Math.random() * 6) + 1
    state.diceValue = val
    state.diceRolled = true

    const canMove = currentTokens.value.some(t => canMoveToken(t))
    if (!canMove) {
      state.message = `${playerName(state.currentPlayer)} 无棋可走，换手`
      setTimeout(() => nextTurn(), 1200)
    } else {
      state.message = `${playerName(state.currentPlayer)} 掷出 ${val}，请选择棋子`
    }
  }

  function canMoveToken(token: Token): boolean {
    if (token.finished) return false
    if (state.diceValue === null) return false
    // in home base: only 6 can bring it out
    if (token.ringPos === -1) return state.diceValue === 6
    // on ring: can move if won't overshoot (must land exactly on 25 or stop before)
    return token.ringPos + state.diceValue! <= RING_SIZE
  }

  function moveToken(tokenId: string) {
    if (!state.diceRolled || state.phase !== 'playing') return
    const token = state.tokens.find(t => t.id === tokenId)
    if (!token || token.player !== state.currentPlayer) return
    if (!canMoveToken(token)) return

    if (token.ringPos === -1) {
      // launch from home base
      token.ringPos = 0
    } else {
      token.ringPos += state.diceValue!
    }

    // check finish
    if (token.ringPos === RING_SIZE) {
      token.finished = true
      token.ringPos = RING_SIZE
      const allDone = state.tokens
        .filter(t => t.player === state.currentPlayer)
        .every(t => t.finished)
      if (allDone) {
        state.phase = 'finished'
        state.winner = state.currentPlayer
        state.message = `🎉 ${playerName(state.currentPlayer)} 获胜！`
        return
      }
    }

    // capture: check if any opponent token is on the same absolute cell
    if (token.ringPos < RING_SIZE) {
      const myAbs = absolutePos(token)
      const opponent: PlayerColor = state.currentPlayer === 'red' ? 'blue' : 'red'
      state.tokens
        .filter(t => t.player === opponent && !t.finished && t.ringPos >= 0)
        .forEach(opp => {
          if (absolutePos(opp) === myAbs) {
            opp.ringPos = -1
            state.message = `💥 踩到 ${playerName(opponent)} 的棋子，回到大本营！`
          }
        })
    }

    // roll 6 → extra turn
    if (state.diceValue === 6) {
      state.diceRolled = false
      state.diceValue = null
      state.message = `${playerName(state.currentPlayer)} 掷出6，再来一次！`
    } else {
      nextTurn()
    }
  }

  function nextTurn() {
    state.currentPlayer = state.currentPlayer === 'red' ? 'blue' : 'red'
    state.diceRolled = false
    state.diceValue = null
    state.message = `${playerName(state.currentPlayer)} 掷骰子`
  }

  function playerName(color: PlayerColor): string {
    return state.players.find(p => p.color === color)?.name ?? color
  }

  function restartGame(redName: string, blueName: string) {
    const fresh = createInitialState(redName, blueName)
    Object.assign(state, fresh)
  }

  return {
    state,
    absolutePos,
    canMoveToken,
    rollDice,
    moveToken,
    restartGame,
    playerName,
  }
}
