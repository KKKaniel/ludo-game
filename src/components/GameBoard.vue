<script setup lang="ts">
import { computed } from 'vue'
import { useGame } from '../composables/useGame'
import RingBoard from './RingBoard.vue'
import DicePanel from './DicePanel.vue'
import HomeBase from './HomeBase.vue'

const props = defineProps<{ redName: string; blueName: string }>()

const { state, canMoveToken, rollDice, moveToken, restartGame, absolutePos, playerName } = useGame()

// sync names from props on mount
state.players[0].name = props.redName
state.players[1].name = props.blueName

const isCurrentPlayer = (color: string) => state.currentPlayer === color

const movableIds = computed(() => {
  if (!state.diceRolled) return new Set<string>()
  return new Set(state.tokens.filter(t => canMoveToken(t)).map(t => t.id))
})
</script>

<template>
  <div class="game-board">
    <!-- 消息栏 -->
    <div class="message-bar">{{ state.message }}</div>

    <!-- 主体：大本营 + 棋盘 + 大本营 -->
    <div class="main-area">
      <!-- 红方大本营 -->
      <HomeBase
        color="red"
        :name="state.players[0].name"
        :tokens="state.tokens.filter(t => t.player === 'red' && t.ringPos === -1)"
        :movable-ids="movableIds"
        :is-active="isCurrentPlayer('red')"
        @move="moveToken"
      />

      <!-- 环形棋盘 -->
      <RingBoard
        :tokens="state.tokens"
        :movable-ids="movableIds"
        :absolute-pos="absolutePos"
        @move="moveToken"
      />

      <!-- 蓝方大本营 -->
      <HomeBase
        color="blue"
        :name="state.players[1].name"
        :tokens="state.tokens.filter(t => t.player === 'blue' && t.ringPos === -1)"
        :movable-ids="movableIds"
        :is-active="isCurrentPlayer('blue')"
        @move="moveToken"
      />
    </div>

    <!-- 骰子面板 -->
    <DicePanel
      :dice-value="state.diceValue"
      :dice-rolled="state.diceRolled"
      :current-player="state.currentPlayer"
      :player-name="playerName(state.currentPlayer)"
      :phase="state.phase"
      @roll="rollDice"
    />

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem;
  width: 100%;
  max-width: 900px;
  position: relative;
}
.message-bar {
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  min-width: 300px;
  text-align: center;
  min-height: 2rem;
}
.main-area {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.winner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.winner-card {
  background: #1a1a2e;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 2.5rem 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.winner-emoji { font-size: 3rem; }
.winner-text { font-size: 1.8rem; font-weight: bold; }
.btn-restart {
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #e74c3c, #3498db);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
}
.btn-restart:hover { opacity: 0.85; }
</style>
