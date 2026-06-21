<script setup lang="ts">
import type { Token } from '../types/game'
import ShinAvatar from './ShinAvatar.vue'
import PigAvatar from './PigAvatar.vue'

const props = defineProps<{
  color: 'red' | 'blue'
  name: string
  tokens: Token[]
  movableIds: Set<string>
  isActive: boolean
}>()
const emit = defineEmits<{ move: [id: string] }>()

const border = props.color === 'red' ? '#e74c3c' : '#3498db'
const bg = props.color === 'red' ? 'rgba(231,76,60,0.12)' : 'rgba(52,152,219,0.12)'
</script>

<template>
  <div class="home-base" :style="{ background: bg, borderColor: border }" :class="{ active: isActive }">
    <!-- 玩家信息栏 -->
    <div class="player-info">
      <div class="avatar-ring" :style="{ borderColor: border }">
        <ShinAvatar v-if="color === 'red'" :size="44" />
        <PigAvatar v-else :size="44" />
      </div>
      <div class="name" :style="{ color: border }">{{ name }}</div>
    </div>
    <!-- 棋子网格 -->
    <div class="tokens-grid">
      <div
        v-for="token in tokens"
        :key="token.id"
        class="token"
        :class="{ movable: movableIds.has(token.id) }"
        :style="{ borderColor: movableIds.has(token.id) ? '#fff' : 'transparent', cursor: movableIds.has(token.id) ? 'pointer' : 'default' }"
        @click="movableIds.has(token.id) && emit('move', token.id)"
      >
        <ShinAvatar v-if="color === 'red'" :size="32" />
        <PigAvatar v-else :size="32" />
      </div>
      <div v-for="i in (4 - tokens.length)" :key="'e'+i" class="token token-empty" />
    </div>
  </div>
</template>

<style scoped>
.home-base {
  border: 2px solid;
  border-radius: 14px;
  padding: 0.75rem;
  width: 120px;
  transition: box-shadow 0.3s;
}
.home-base.active { box-shadow: 0 0 18px rgba(255,255,255,0.2); }
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 0.6rem;
}
.avatar-ring {
  border: 2.5px solid;
  border-radius: 50%;
  padding: 2px;
  background: rgba(255,255,255,0.05);
}
.name { font-weight: bold; font-size: 0.82rem; text-align: center; }
.tokens-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.token {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  background: rgba(255,255,255,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.token.movable {
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
  animation: pulse 0.9s infinite alternate;
}
.token:hover:not(.token-empty) { transform: scale(1.12); }
.token-empty {
  background: rgba(255,255,255,0.04);
  border: 2px dashed rgba(255,255,255,0.1) !important;
}
@keyframes pulse {
  from { box-shadow: 0 0 6px rgba(255,255,255,0.3); }
  to { box-shadow: 0 0 14px rgba(255,255,255,0.7); }
}
</style>
