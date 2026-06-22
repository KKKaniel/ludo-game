<script setup lang="ts">
const props = defineProps<{
  diceValue: number | null
  diceRolled: boolean
  isAnimating: { value: boolean }
  currentPlayer: string
  playerName: string
  phase: string
}>()
const emit = defineEmits<{ roll: [] }>()

const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
</script>

<template>
  <div class="dice-panel">
    <div
      class="dice"
      :class="{
        'dice-red': currentPlayer === 'red',
        'dice-blue': currentPlayer === 'blue',
        'dice-roll-anim': !diceRolled && !isAnimating.value && phase === 'playing',
      }"
      @click="emit('roll')"
    >
      <span class="dice-face">{{ diceValue ? faces[diceValue] : '🎲' }}</span>
    </div>
    <div class="hint">
      <span v-if="phase === 'finished'">🎉</span>
      <span v-else-if="isAnimating.value">✈️ 移动中…</span>
      <span v-else-if="!diceRolled">点击掷骰</span>
      <span v-else>选择棋子</span>
    </div>
  </div>
</template>

<style scoped>
.dice-panel { display:flex; flex-direction:column; align-items:center; gap:0.4rem; }
.dice {
  width: 72px; height: 72px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.6rem;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.07);
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}
.dice:hover { transform: scale(1.08); }
.dice-red { border-color: #e74c3c; box-shadow: 0 0 12px rgba(231,76,60,0.4); }
.dice-blue { border-color: #3498db; box-shadow: 0 0 12px rgba(52,152,219,0.4); }
.dice-roll-anim { animation: shake 1.5s infinite; }
@keyframes shake {
  0%,100% { transform: rotate(0deg); }
  20% { transform: rotate(-8deg) scale(1.05); }
  40% { transform: rotate(8deg) scale(1.05); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(5deg); }
}
.hint { font-size: 0.82rem; color: rgba(255,255,255,0.5); }
</style>
