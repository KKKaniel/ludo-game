<script setup lang="ts">
import { computed } from 'vue'
import type { Token } from '../types/game'
import { RING_SIZE, BLUE_START_OFFSET, INNER_PATH } from '../composables/useGame'
import { PENALTIES, LEVEL_COLOR, LEVEL_STROKE, LEVEL_EMOJI } from '../composables/penalties'

const props = defineProps<{
  tokens: Token[]
  movableIds: Set<string>
  animatingId: string | null
  absolutePos: (t: Token) => number
}>()
const emit = defineEmits<{ move: [id: string] }>()

const CELL = 54
const GAP = 4
const STEP = CELL + GAP
const COLS = 7
const SVG_SIZE = COLS * STEP + GAP
const FINISH_POS = 30

const outerCells: { col: number; row: number }[] = [
  ...Array.from({ length: 7 }, (_, i) => ({ col: i, row: 0 })),
  ...Array.from({ length: 5 }, (_, i) => ({ col: 6, row: i + 1 })),
  ...Array.from({ length: 7 }, (_, i) => ({ col: 6 - i, row: 6 })),
  ...Array.from({ length: 6 }, (_, i) => ({ col: 0, row: 5 - i })),
]

function cellXY(col: number, row: number) {
  return { x: GAP + col * STEP, y: GAP + row * STEP }
}

const redInnerPath = [
  { col: 1, row: 1 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 2, row: 3 }, { col: 3, row: 3 },
]
const blueInnerPath = [
  { col: 5, row: 5 }, { col: 5, row: 4 }, { col: 4, row: 4 }, { col: 4, row: 3 }, { col: 3, row: 3 },
]

function innerCellXY(player: 'red' | 'blue', idx: number) {
  const path = player === 'red' ? redInnerPath : blueInnerPath
  const { col, row } = path[Math.min(idx, path.length - 1)]
  return cellXY(col, row)
}

function tokensOnOuter(absPos: number) {
  return props.tokens.filter(
    t => !t.finished && t.ringPos >= 0 && t.ringPos < RING_SIZE && props.absolutePos(t) === absPos
  )
}
function tokensOnInner(player: 'red' | 'blue', idx: number) {
  return props.tokens.filter(t => t.player === player && t.ringPos === RING_SIZE + idx)
}

const finishedTokens = computed(() => props.tokens.filter(t => t.finished))
const finishedRed = computed(() => finishedTokens.value.filter(t => t.player === 'red').length)
const finishedBlue = computed(() => finishedTokens.value.filter(t => t.player === 'blue').length)

function offset(i: number, total: number) { return (i - (total - 1) / 2) * 13 }
function isAnim(t: Token) { return t.id === props.animatingId }

const outerList = Array.from({ length: RING_SIZE }, (_, i) => i)
const innerList = Array.from({ length: INNER_PATH }, (_, i) => i)
const centerXY = cellXY(3, 3)
const CCX = centerXY.x + CELL / 2
const CCY = centerXY.y + CELL / 2

function penaltyForCell(absPos: number) { return PENALTIES[absPos] ?? null }
</script>

<template>
  <div class="board-wrap">
    <svg :width="SVG_SIZE" :height="SVG_SIZE" class="board-svg">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-gold"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-anim"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <rect width="100%" height="100%" rx="14" fill="#0f0f23"/>

      <!-- red inner path -->
      <rect v-for="(c,i) in redInnerPath.slice(0,4)" :key="'rbg'+i"
        :x="cellXY(c.col,c.row).x" :y="cellXY(c.col,c.row).y"
        :width="CELL" :height="CELL" rx="6"
        fill="rgba(231,76,60,0.2)" stroke="rgba(231,76,60,0.45)" stroke-width="1.5"/>

      <!-- blue inner path -->
      <rect v-for="(c,i) in blueInnerPath.slice(0,4)" :key="'bbg'+i"
        :x="cellXY(c.col,c.row).x" :y="cellXY(c.col,c.row).y"
        :width="CELL" :height="CELL" rx="6"
        fill="rgba(52,152,219,0.2)" stroke="rgba(52,152,219,0.45)" stroke-width="1.5"/>

      <!-- center finish -->
      <rect :x="centerXY.x" :y="centerXY.y" :width="CELL" :height="CELL" rx="8"
        fill="rgba(255,215,0,0.22)" stroke="gold" stroke-width="2.5" filter="url(#glow-gold)"/>
      <text :x="CCX" :y="CCY-8" text-anchor="middle" dominant-baseline="middle" class="finish-label">终点</text>
      <text :x="CCX" :y="CCY+12" text-anchor="middle" class="finish-score">
        <tspan fill="#e74c3c">{{ finishedRed }}</tspan><tspan fill="#aaa">/</tspan><tspan fill="#3498db">{{ finishedBlue }}</tspan>
      </text>

      <!-- outer ring cells -->
      <g v-for="pos in outerList" :key="'oc'+pos">
        <!-- cell background -->
        <rect
          :x="cellXY(outerCells[pos].col, outerCells[pos].row).x"
          :y="cellXY(outerCells[pos].col, outerCells[pos].row).y"
          :width="CELL" :height="CELL" rx="6"
          :fill="penaltyForCell(pos)
            ? LEVEL_COLOR[penaltyForCell(pos)!.level]
            : pos===0 ? 'rgba(231,76,60,0.3)'
            : pos===BLUE_START_OFFSET ? 'rgba(52,152,219,0.3)'
            : 'rgba(255,255,255,0.06)'"
          :stroke="penaltyForCell(pos)
            ? LEVEL_STROKE[penaltyForCell(pos)!.level]
            : pos===0 ? '#e74c3c'
            : pos===BLUE_START_OFFSET ? '#3498db'
            : 'rgba(255,255,255,0.14)'"
          :stroke-width="penaltyForCell(pos) ? 2 : (pos===0||pos===BLUE_START_OFFSET) ? 2 : 1.5"
        />
        <!-- penalty emoji top-right -->
        <text v-if="penaltyForCell(pos)"
          :x="cellXY(outerCells[pos].col, outerCells[pos].row).x + CELL - 4"
          :y="cellXY(outerCells[pos].col, outerCells[pos].row).y + 14"
          text-anchor="end" dominant-baseline="middle" style="font-size:12px;pointer-events:none"
        >{{ LEVEL_EMOJI[penaltyForCell(pos)!.level] }}</text>
        <!-- cell number -->
        <text
          :x="cellXY(outerCells[pos].col, outerCells[pos].row).x + CELL/2"
          :y="cellXY(outerCells[pos].col, outerCells[pos].row).y + CELL/2"
          text-anchor="middle" dominant-baseline="middle" class="cell-num"
        >{{ pos+1 }}</text>

        <!-- tokens -->
        <g v-for="(t,ti) in tokensOnOuter(pos)" :key="t.id"
          @click="movableIds.has(t.id) && emit('move', t.id)"
          :style="{cursor: movableIds.has(t.id)?'pointer':'default'}">
          <circle
            :cx="cellXY(outerCells[pos].col,outerCells[pos].row).x+CELL/2+offset(ti,tokensOnOuter(pos).length)"
            :cy="cellXY(outerCells[pos].col,outerCells[pos].row).y+CELL/2"
            :r="isAnim(t)?17:14"
            :fill="t.player==='red'?'rgba(231,76,60,0.9)':'rgba(52,152,219,0.9)'"
            :stroke="isAnim(t)?'#FFD700':movableIds.has(t.id)?'#fff':'rgba(255,255,255,0.3)'"
            :stroke-width="isAnim(t)?3:movableIds.has(t.id)?2.5:1"
            :filter="isAnim(t)?'url(#glow-anim)':movableIds.has(t.id)?'url(#glow)':''"
            :class="{movable:movableIds.has(t.id), animating:isAnim(t)}"
          />
          <text
            :x="cellXY(outerCells[pos].col,outerCells[pos].row).x+CELL/2+offset(ti,tokensOnOuter(pos).length)"
            :y="cellXY(outerCells[pos].col,outerCells[pos].row).y+CELL/2"
            text-anchor="middle" dominant-baseline="middle" style="font-size:13px;pointer-events:none"
          >{{ t.player==='red'?'🗒':'🐷' }}</text>
        </g>
      </g>

      <!-- red inner tokens -->
      <g v-for="idx in innerList" :key="'ri'+idx">
        <g v-for="(t,ti) in tokensOnInner('red',idx)" :key="t.id"
          @click="movableIds.has(t.id) && emit('move', t.id)"
          :style="{cursor:movableIds.has(t.id)?'pointer':'default'}">
          <circle
            :cx="innerCellXY('red',idx).x+CELL/2+offset(ti,tokensOnInner('red',idx).length)"
            :cy="innerCellXY('red',idx).y+CELL/2"
            :r="isAnim(t)?17:14" fill="rgba(231,76,60,0.9)"
            :stroke="isAnim(t)?'#FFD700':movableIds.has(t.id)?'#fff':'rgba(255,255,255,0.3)'"
            :stroke-width="isAnim(t)?3:2.5"
            :filter="isAnim(t)?'url(#glow-anim)':movableIds.has(t.id)?'url(#glow)':''"
            :class="{movable:movableIds.has(t.id),animating:isAnim(t)}"/>
          <text :x="innerCellXY('red',idx).x+CELL/2+offset(ti,tokensOnInner('red',idx).length)"
            :y="innerCellXY('red',idx).y+CELL/2"
            text-anchor="middle" dominant-baseline="middle" style="font-size:13px;pointer-events:none">🗒</text>
        </g>
      </g>

      <!-- blue inner tokens -->
      <g v-for="idx in innerList" :key="'bi'+idx">
        <g v-for="(t,ti) in tokensOnInner('blue',idx)" :key="t.id"
          @click="movableIds.has(t.id) && emit('move', t.id)"
          :style="{cursor:movableIds.has(t.id)?'pointer':'default'}">
          <circle
            :cx="innerCellXY('blue',idx).x+CELL/2+offset(ti,tokensOnInner('blue',idx).length)"
            :cy="innerCellXY('blue',idx).y+CELL/2"
            :r="isAnim(t)?17:14" fill="rgba(52,152,219,0.9)"
            :stroke="isAnim(t)?'#FFD700':movableIds.has(t.id)?'#fff':'rgba(255,255,255,0.3)'"
            :stroke-width="isAnim(t)?3:2.5"
            :filter="isAnim(t)?'url(#glow-anim)':movableIds.has(t.id)?'url(#glow)':''"
            :class="{movable:movableIds.has(t.id),animating:isAnim(t)}"/>
          <text :x="innerCellXY('blue',idx).x+CELL/2+offset(ti,tokensOnInner('blue',idx).length)"
            :y="innerCellXY('blue',idx).y+CELL/2"
            text-anchor="middle" dominant-baseline="middle" style="font-size:13px;pointer-events:none">🐷</text>
        </g>
      </g>

      <!-- finished at center -->
      <g v-for="(t,i) in finishedTokens" :key="'fin'+t.id">
        <circle :cx="CCX+(i%2===0?-10:10)" :cy="CCY+(i<2?-10:10)" r="9"
          :fill="t.player==='red'?'#e74c3c':'#3498db'" stroke="gold" stroke-width="2"/>
        <text :x="CCX+(i%2===0?-10:10)" :y="CCY+(i<2?-10:10)"
          text-anchor="middle" dominant-baseline="middle" style="font-size:10px;pointer-events:none">
          {{ t.player==='red'?'🗒':'🐷' }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.board-wrap { display:flex; align-items:center; justify-content:center; }
.board-svg { border-radius:14px; box-shadow:0 8px 40px rgba(0,0,0,0.6); }
.cell-num { font-size:10px; fill:rgba(255,255,255,0.3); pointer-events:none; user-select:none; }
.finish-label { font-size:11px; font-weight:bold; fill:gold; pointer-events:none; }
.finish-score { font-size:13px; font-weight:bold; pointer-events:none; }
.movable { animation: pulse 0.9s infinite alternate; }
.animating { animation: bounce 0.32s ease-in-out infinite alternate; }
@keyframes pulse { from{filter:brightness(1)} to{filter:brightness(1.7) drop-shadow(0 0 6px #fff)} }
@keyframes bounce { from{transform:scale(1)} to{transform:scale(1.15)} }
</style>
