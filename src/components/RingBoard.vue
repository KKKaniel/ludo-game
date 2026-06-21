<script setup lang="ts">
import type { Token } from '../types/game'

const props = defineProps<{
  tokens: Token[]
  movableIds: Set<string>
  absolutePos: (t: Token) => number
}>()
const emit = defineEmits<{ move: [id: string] }>()

const RING_SIZE = 25
const CENTER = 160
const RADIUS = 130
const CELL_R = 22

// compute (x, y) for each ring cell
function cellXY(pos: number): { x: number; y: number } {
  const angle = (pos / RING_SIZE) * 2 * Math.PI - Math.PI / 2
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  }
}

// tokens on ring (not in home base, not finished)
function tokensOnCell(pos: number): Token[] {
  return props.tokens.filter(
    t => !t.finished && t.ringPos >= 0 && props.absolutePos(t) === pos
  )
}

const tokenColor = (t: Token) => t.player === 'red' ? '#e74c3c' : '#3498db'
const cells = Array.from({ length: RING_SIZE }, (_, i) => i)

// finished tokens
const finishedRed = props.tokens.filter(t => t.player === 'red' && t.finished).length
const finishedBlue = props.tokens.filter(t => t.player === 'blue' && t.finished).length
</script>

<template>
  <div class="ring-wrap">
    <svg :width="CENTER * 2" :height="CENTER * 2" class="ring-svg">
      <!-- ring cells -->
      <g v-for="pos in cells" :key="pos">
        <circle
          :cx="cellXY(pos).x"
          :cy="cellXY(pos).y"
          :r="CELL_R"
          :class="['cell', pos === 0 ? 'cell-red-start' : pos === 12 ? 'cell-blue-start' : 'cell-normal']"
        />
        <text
          :x="cellXY(pos).x"
          :y="cellXY(pos).y + 1"
          text-anchor="middle"
          dominant-baseline="middle"
          class="cell-num"
        >{{ pos + 1 }}</text>

        <!-- tokens on this cell -->
        <g
          v-for="(token, ti) in tokensOnCell(pos)"
          :key="token.id"
          @click="movableIds.has(token.id) && emit('move', token.id)"
          :style="{ cursor: movableIds.has(token.id) ? 'pointer' : 'default' }"
        >
          <circle
            :cx="cellXY(pos).x + (ti - tokensOnCell(pos).length / 2 + 0.5) * 10"
            :cy="cellXY(pos).y"
            r="8"
            :fill="tokenColor(token)"
            :stroke="movableIds.has(token.id) ? '#fff' : 'rgba(255,255,255,0.4)'"
            :stroke-width="movableIds.has(token.id) ? 2.5 : 1"
            :class="{ 'token-movable': movableIds.has(token.id) }"
          />
        </g>
      </g>

      <!-- center finish area -->
      <circle :cx="CENTER" :cy="CENTER" r="40" class="center-area" />
      <text :x="CENTER" :y="CENTER - 10" text-anchor="middle" dominant-baseline="middle" class="center-label">终点</text>
      <text :x="CENTER" :y="CENTER + 12" text-anchor="middle" class="center-score">
        <tspan fill="#e74c3c">{{ finishedRed }}</tspan>
        <tspan fill="#aaa"> / </tspan>
        <tspan fill="#3498db">{{ finishedBlue }}</tspan>
      </text>
    </svg>
  </div>
</template>

<style scoped>
.ring-wrap { display: flex; align-items: center; justify-content: center; }
.ring-svg { overflow: visible; }
.cell { stroke: rgba(255,255,255,0.2); stroke-width: 1.5; }
.cell-normal { fill: rgba(255,255,255,0.07); }
.cell-red-start { fill: rgba(231,76,60,0.35); stroke: #e74c3c; stroke-width: 2; }
.cell-blue-start { fill: rgba(52,152,219,0.35); stroke: #3498db; stroke-width: 2; }
.cell-num { font-size: 9px; fill: rgba(255,255,255,0.45); pointer-events: none; user-select: none; }
.center-area { fill: rgba(255,255,255,0.06); stroke: rgba(255,255,255,0.15); stroke-width: 1.5; }
.center-label { font-size: 13px; font-weight: bold; fill: #fff; pointer-events: none; }
.center-score { font-size: 16px; font-weight: bold; pointer-events: none; }
.token-movable { animation: pulse 1s infinite alternate; }
@keyframes pulse {
  from { filter: brightness(1); }
  to { filter: brightness(1.5) drop-shadow(0 0 4px #fff); }
}
</style>
