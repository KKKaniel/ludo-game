<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ start: [red: string, blue: string] }>()
const redName = ref('玩家一')
const blueName = ref('玩家二')

function start() {
  emit('start', redName.value.trim() || '玩家一', blueName.value.trim() || '玩家二')
}
</script>

<template>
  <div class="setup">
    <h1>✈️ 飞行棋</h1>
    <p class="subtitle">2人 · 环形25格 · 每人4棋子</p>
    <div class="form">
      <div class="player-row red-row">
        <span class="dot" style="background:#e74c3c"></span>
        <input v-model="redName" maxlength="10" placeholder="红方名字" />
      </div>
      <div class="player-row blue-row">
        <span class="dot" style="background:#3498db"></span>
        <input v-model="blueName" maxlength="10" placeholder="蓝方名字" />
      </div>
      <button class="btn-start" @click="start">开始游戏</button>
    </div>
  </div>
</template>

<style scoped>
.setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}
h1 { font-size: 2.5rem; letter-spacing: 2px; }
.subtitle { color: #aaa; font-size: 0.95rem; }
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 260px;
}
.player-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.5rem 1rem;
}
.dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  width: 100%;
}
.btn-start {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #e74c3c, #3498db);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-start:hover { opacity: 0.85; }
</style>
