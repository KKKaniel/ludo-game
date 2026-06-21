<script setup lang="ts">
import type { Token } from '../types/game'

const props = defineProps<{
  color: 'red' | 'blue'
  name: string
  tokens: Token[]
  movableIds: Set<string>
  isActive: boolean
}>()
const emit = defineEmits<{ move: [id: string] }>()

const bg = props.color === 'red'
  ? 'rgba(231,76,60,0.12)'
  : 'rgba(52,152,219,0.12)'
const border = props.color === 'red' ? '#e74c3c' : '#3498db'
const tokenFill = props.color === 'red' ? '#e74c3c' : '#3498db'
</script>

<template>
  <div
    class="home-base"
    :style="{ background: bg, borderColor: border }"
    :class="{ active: isActive }"
  >
    <div class="name" :style="{ color: border }">{{ name }}</div>
    <div class="tokens-grid">
      <div
        v-for="token in tokens"
        :key="token.id"
        class="token"
        :style="{
          background: tokenFill,
          boxShadow: movableIds.has(token.id) ? `0 0 10px ${border}` : 'none',
          cursor: movableIds.has(token.id) ? 'pointer' : 'default',
          border: movableIds.has(token.id) ? '2px solid #fff' : '2px solid transparent',
        }"
        @click="movableIds.has(token.id) && emit('move', token.id)"
      >
        <span class="token-icon">✈</span>
      </div>
      <!-- empty slots -->
      <div
        v-for="i in (4 - tokens.length)"
        :key="'empty-' + i"
        class="token token-empty"
      />
    </div>
  </div>
</template>

<style scoped>
.home-base {
  border: 2px solid;
  border-radius: 12px;
  padding: 0.75rem;
  width: 110px;
  transition: box-shadow 0.3s;
}
.home-base.active {
  box-shadow: 0 0 16px rgba(255,255,255,0.2);
}
.name {
  font-weight: bold;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 0.5rem;
}
.tokens-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.token {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: box-shadow 0.2s, transform 0.2s;
}
.token:hover:not(.token-empty) { transform: scale(1.1); }
.token-empty {
  background: rgba(255,255,255,0.05);
  border: 2px dashed rgba(255,255,255,0.1) !important;
}
.token-icon { pointer-events: none; }
</style>
