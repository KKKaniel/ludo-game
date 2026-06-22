import { reactive, computed, ref } from 'vue'
import type { GameState, Token, PlayerColor } from '../types/game'

export const RING_SIZE = 25
export const INNER_PATH = 5
export const FINISH_POS = 30
const TOKENS_PER_PLAYER = 4
export const BLUE_START_OFFSET = 12
const STEP_DELAY = 320 // ms per step

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
  // true while a token is animating — blocks dice roll and token selection
  const isAnimating = ref(false)
  // id of the token currently animating (for highlight)
  const animatingId = ref<string | null>(null)

  function absolutePos(token: Token): number {
    if (token.ringPos < 0 || token.ringPos >= RING_SIZE) return -1
    const offset = token.player === 'red' ? 0 : BLUE_START_OFFSET
    return (offset + token.ringPos) % RING_SIZE
  }

  const currentTokens = computed(() =>
    state.tokens.filter(t => t.player === state.currentPlayer)
  )

  function canMoveToken(token: Token): boolean {
    if (token.finished) return false
    if (state.diceValue === null) return false
    if (token.ringPos === -1) return true
    return token.ringPos + state.diceValue! <= FINISH_POS
  }

  function rollDice() {
    if (state.diceRolled || state.phase !== 'playing' || isAnimating.value) return
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
    if (!state.diceRolled || state.phase !== 'playing' || isAnimating.value) return
    const token = state.tokens.find(t => t.id === tokenId)
    if (!token || token.player !== state.currentPlayer) return
    if (!canMoveToken(token)) return

    const steps = state.diceValue!
    // starting position: -1 means first step lands on pos 1 (diceValue steps from 0)
    const startPos = token.ringPos === -1 ? 0 : token.ringPos
    const targetPos = token.ringPos === -1 ? steps : token.ringPos + steps

    // lock board during animation
    isAnimating.value = true
    animatingId.value = tokenId
    state.diceRolled = false // hide movable highlights while animating
    state.message = `✈️ 移动中…`

    // set to start before animating
    if (token.ringPos === -1) token.ringPos = 0

    let step = 0
    const interval = setInterval(() => {
      step++
      const nextPos = startPos + step
      token.ringPos = Math.min(nextPos, FINISH_POS)

      if (step >= steps) {
        clearInterval(interval)
        token.ringPos = Math.min(targetPos, FINISH_POS)
        animatingId.value = null
        isAnimating.value = false
        afterMove(token)
      }
    }, STEP_DELAY)
  }

  function afterMove(token: Token) {
    // check finish
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

    // capture on outer ring
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
    isAnimating.value = false
    animatingId.value = null
    const fresh = createInitialState(redName, blueName)
    Object.assign(state, fresh)
  }

  return {
    state,
    isAnimating,
    animatingId,
    absolutePos,
    canMoveToken,
    rollDice,
    moveToken,
    restartGame,
    playerName,
  }
}
