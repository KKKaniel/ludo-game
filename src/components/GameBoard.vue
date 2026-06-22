<script setup lang="ts">
import { computed } from 'vue'
import { useGame } from '../composables/useGame'
import { LEVEL_COLOR, LEVEL_STROKE, LEVEL_EMOJI } from '../composables/penalties'
import RingBoard from './RingBoard.vue'
import DicePanel from './DicePanel.vue'
import HomeBase from './HomeBase.vue'

const props = defineProps<{ redName: string; blueName: string }>()
const {
  state, isAnimating, animatingId,
  canMoveToken, rollDice, moveToken,
  confirmPenalty, restartGame, absolutePos, playerName
} = useGame()

state.players[0].name = props.redName
state.players[1].name = props.blueName

const isCurrentPlayer = (color: string) => state.currentPlayer === color

const movableIds = computed(() => {
  if (!state.diceRolled || isAnimating.value || state.phase !== 'playing') return new Set<string>()
  return new Set(state.tokens.filter(t => canMoveToken(t)).map(t => t.id))
})

const penaltyBg = computed(() =>
  state.penalty ? LEVEL_COLOR[state.penalty.level] : 'rgba(0,0,0,0.7)'
)
const penaltyBorder = computed(() =>
  state.penalty ? LEVEL_STROKE[state.penalty.level] : '#fff'
)
const penaltyEmoji = computed(() =>
  state.penalty ? LEVEL_EMOJI[state.penalty.level] : ''
)
const penaltyPlayerName = computed(() =>
  state.currentPlayer === 'red' ? state.players[0].name : state.players[1].name
)
</script>

<template>
  <div class="game-board">
    <div class="message-bar">{{ state.message }}</div>

    <div class="main-area">
      <HomeBase color="red" :name="state.players[0].name"
        :tokens="state.tokens.filter(t => t.player === 'red' && t.ringPos === -1)"
        :movable-ids="movableIds" :animating-id="animatingId"
        :is-active="isCurrentPlayer('red')" @move="moveToken" />

      <RingBoard :tokens="state.tokens" :movable-ids="movableIds"
        :animating-id="animatingId" :absolute-pos="absolutePos" @move="moveToken" />

      <HomeBase color="blue" :name="state.players[1].name"
        :tokens="state.tokens.filter(t => t.player === 'blue' && t.ringPos === -1)"
        :movable-ids="movableIds" :animating-id="animatingId"
        :is-active="isCurrentPlayer('blue')" @move="moveToken" />
    </div>

    <DicePanel :dice-value="state.diceValue" :dice-rolled="state.diceRolled"
      :is-animating="isAnimating" :current-player="state.currentPlayer"
      :player-name="playerName(state.currentPlayer)" :phase="state.phase"
      @roll="rollDice" />

    <!-- 惩罚弹窗 -->
    <Transition name="penalty">
      <div v-if="state.phase === 'penalty' && state.penalty" class="penalty-overlay">
        <div class="penalty-card"
          :style="{ background: `linear-gradient(135deg, #1a1a2e, ${penaltyBg})`, borderColor: penaltyBorder }">
          <div class="penalty-header">
            <span class="penalty-level-emoji">{{ penaltyEmoji }}</span>
            <span class="penalty-title">{{ penaltyPlayerName }} 踩中惩罚格！</span>
          </div>
          <div class="penalty-text">{{ state.penalty.text }}</div>
          <button class="btn-confirm" :style="{ borderColor: penaltyBorder, color: penaltyBorder }"
            @click="confirmPenalty">
            ✅ 执行完毕，继续游戏
          </button>
        </div>
      </div>
    </Transition>

    <!-- 胜利弹窗 -->
    <div v-if="state.phase === 'finished'" class="winner-overlay">
      <div class="winner-card">
        <div class="winner-emoji">🏆</div>
        <div class="winner-text">{{ state.winner === 'red' ? state.players[0].name : state.players[1].name }} 获胜！</div>
        <button class="btn-restart" @click="restartGame(state.players[0].name, state.players[1].name)">再来一局</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  display: flex; flex-direction: column; align-items: center;
  gap: 1.2rem; padding: 1rem; width: 100%; max-width: 900px; position: relative;
}
.message-bar {
  background: rgba(255,255,255,0.08); border-radius: 8px;
  padding: 0.5rem 1.5rem; font-size: 1rem;
  min-width: 300px; text-align: center; min-height: 2rem;
}
.main-area {
  display: flex; align-items: center; gap: 1.5rem;
  flex-wrap: wrap; justify-content: center;
}
/* 惩罚弹窗 */
.penalty-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center; z-index: 100;
  backdrop-filter: blur(4px);
}
.penalty-card {
  border: 2px solid; border-radius: 20px;
  padding: 2rem 2.5rem; max-width: 380px; width: 90%;
  text-align: center; display: flex; flex-direction: column; gap: 1.2rem;
  box-shadow: 0 16px 60px rgba(0,0,0,0.6);
}
.penalty-header { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.penalty-level-emoji { font-size: 2rem; }
.penalty-title { font-size: 1.1rem; font-weight: bold; color: white; }
.penalty-text {
  font-size: 1.25rem; font-weight: 600; color: #fff;
  line-height: 1.6; background: rgba(0,0,0,0.3);
  border-radius: 10px; padding: 1rem;
}
.btn-confirm {
  padding: 0.7rem 1.5rem; background: transparent;
  border: 2px solid; border-radius: 10px;
  font-size: 1rem; cursor: pointer; font-weight: bold;
  transition: background 0.2s;
}
.btn-confirm:hover { background: rgba(255,255,255,0.1); }
/* 胜利弹窗 */
.winner-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.winner-card {
  background: #1a1a2e; border: 2px solid rgba(255,255,255,0.2);
  border-radius: 16px; padding: 2.5rem 3rem;
  text-align: center; display: flex; flex-direction: column; gap: 1rem;
}
.winner-emoji { font-size: 3rem; }
.winner-text { font-size: 1.8rem; font-weight: bold; }
.btn-restart {
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #e74c3c, #3498db);
  color: white; border: none; border-radius: 8px;
  font-size: 1rem; cursor: pointer; font-weight: bold;
}
.btn-restart:hover { opacity: 0.85; }
/* 惩罚弹窗入场动画 */
.penalty-enter-active { animation: pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.penalty-leave-active { animation: pop-out 0.2s ease-in; }
@keyframes pop-in { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
@keyframes pop-out { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.8); } }
</style>
