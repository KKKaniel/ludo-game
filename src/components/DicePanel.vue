<script setup lang="ts">
const props = defineProps<{
  diceValue: number | null
  diceRolled: boolean
  currentPlayer: 'red' | 'blue'
  playerName: string
  phase: string
}>()
const emit = defineEmits<{ roll: [] }>()

const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const color = () => props.currentPlayer === 'red' ? '#e74c3c' : '#3498db'
</script>

<template>
  <div class="dice-panel">
    <div class="dice-face" :style="{ color: color() }">
      {{ diceValue !== null ? faces[diceValue] : '🎲' }}
    </div>
    <button
      class="btn-roll"
      :disabled="diceRolled || phase !== 'playing'"
      :style="{ background: `linear-gradient(135deg, ${color()}, #555)` }"
      @click="emit('roll')"
    >
      {{ diceRolled ? `已掷出 ${diceValue}` : `${playerName} 掷骰子` }}
    </button>
  </div>
</template>

<style scoped>
.dice-panel {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
}
.dice-face {
  font-size: 2.8rem;
  line-height: 1;
  min-width: 2.8rem;
  text-align: center;
}
.btn-roll {
  padding: 0.6rem 1.5rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-roll:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-roll:not(:disabled):hover { opacity: 0.85; }
</style>
