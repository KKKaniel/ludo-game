import { reactive, computed } from 'vue'
import type { GameState, Token, PlayerColor } from '../types/game'

export const RING_SIZE = 25
export const INNER_PATH = 5   // cells 25~29
export const FINISH_POS = 30  // center finish
const TOKENS_PER_PLAYER = 4
export const BLUE_START_OFFSET = 12

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

  // absolute outer ring position (only valid when ringPos < RING_SIZE)
  function absolutePos(token: Token): number {
    if (token.ringPos < 0 || token.ringPos >= RING_SIZE) return -1
    const offset = token.player === 'red' ? 0 : BLUE_START_OFFSET
    return (offset + token.ringPos) % RING_SIZE
  }

  // entry cell of inner path for each player on the outer ring
  // red enters after cell 24 (index 24), blue enters after cell 24 offset by 12
  // i.e. red's entry is at outer ringPos 24, blue's at outer ringPos 24
  // Both enter inner path when they complete the full outer ring

  const currentTokens = computed(() =>
    state.tokens.filter(t => t.player === state.currentPlayer)
  )

  function canMoveToken(token: Token): boolean {
    if (token.finished) return false
    if (state.diceValue === null) return false
    // any value can bring token out of home base
    if (token.ringPos === -1) return true
    // cannot overshoot finish
    return token.ringPos + state.diceValue! <= FINISH_POS
  }

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

  function moveToken(tokenId: string) {
    if (!state.diceRolled || state.phase !== 'playing') return
    const token = state.tokens.find(t => t.id === tokenId)
    if (!token || token.player !== state.currentPlayer) return
    if (!canMoveToken(token)) return

    if (token.ringPos === -1) {
      token.ringPos = state.diceValue!
    } else {
      token.ringPos += state.diceValue!
    }

    // wrap outer ring: after 24 continue into inner path (25+)
    // ringPos 25~29 = inner path, 30 = finish
    // no wrap needed since inner path continues linearly

    if (token.ringPos >= FINISH_POS) {
      token.ringPos = FINISH_POS
      token.finished = true
      const allDone = state.tokens
        .filter(t => t.player === state.currentPlayer)
        .every(t => t.finished)
      if (allDone) {
        state.phase = 'finished'
        state.winner = state.currentPlayer
        state.message = `🎉 ${playerName(state.currentPlayer)} 获胜！`
        return
      }
      state.message = `✨ ${playerName(state.currentPlayer)} 有棋到达终点！`
    }

    // capture: only on outer ring cells
    if (token.ringPos >= 0 && token.ringPos < RING_SIZE) {
      const myAbs = absolutePos(token)
      const opponent: PlayerColor = state.currentPlayer === 'red' ? 'blue' : 'red'
      state.tokens
        .filter(t => t.player === opponent && !t.finished && t.ringPos >= 0 && t.ringPos < RING_SIZE)
        .forEach(opp => {
          if (absolutePos(opp) === myAbs) {
            opp.ringPos = -1
            state.message = `💥 踩到 ${playerName(opponent)} 的棋子，回到大本营！`
          }
        })
    }

    nextTurn()
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
