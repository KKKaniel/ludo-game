<script setup lang="ts">
import { computed } from 'vue'
import type { Token } from '../types/game'
import { RING_SIZE, BLUE_START_OFFSET, INNER_PATH, FINISH_POS } from '../composables/useGame'

const props = defineProps<{
  tokens: Token[]
  movableIds: Set<string>
  absolutePos: (t: Token) => number
}>()
const emit = defineEmits<{ move: [id: string] }>()

// ── Board geometry ──────────────────────────────────────────
// Square outer ring: 7 cols x 7 rows grid, cells on perimeter = 24, plus 1 extra = 25
// Layout: top row L→R (0-6), right col T→B (7-12), bottom row R→L (13-18), left col B→T (19-24)
const CELL = 54       // cell size px
const GAP = 4
const STEP = CELL + GAP
const COLS = 7
const SVG_SIZE = COLS * STEP + GAP

// Outer ring cell positions (grid col, row) for 25 cells
const outerCells: { col: number; row: number }[] = [
  // top row left→right (row 0, col 0..6) = 7 cells (pos 0-6)
  ...Array.from({ length: 7 }, (_, i) => ({ col: i, row: 0 })),
  // right col top→bottom (col 6, row 1..5) = 5 cells (pos 7-11)
  ...Array.from({ length: 5 }, (_, i) => ({ col: 6, row: i + 1 })),
  // bottom row right→left (row 6, col 6..0) = 7 cells (pos 12-18)
  ...Array.from({ length: 7 }, (_, i) => ({ col: 6 - i, row: 6 })),
  // left col bottom→top (col 0, row 5..1) = 6 cells (pos 19-24)
  ...Array.from({ length: 6 }, (_, i) => ({ col: 0, row: 5 - i })),
]

function cellXY(col: number, row: number) {
  return { x: GAP + col * STEP, y: GAP + row * STEP }
}

// Inner path: 5 cells toward center from red's entry (col 0, row 0)
// Red inner path goes diagonally inward from top-left
// Blue inner path goes from bottom-right inward
// Both converge to center cell (col 3, row 3)
const redInnerPath: { col: number; row: number }[] = [
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 2 },
  { col: 2, row: 3 },
  { col: 3, row: 3 }, // center = finish
]
const blueInnerPath: { col: number; row: number }[] = [
  { col: 5, row: 5 },
  { col: 5, row: 4 },
  { col: 4, row: 4 },
  { col: 4, row: 3 },
  { col: 3, row: 3 }, // center = finish
]

function innerCellXY(player: 'red' | 'blue', innerIdx: number) {
  const path = player === 'red' ? redInnerPath : blueInnerPath
  const { col, row } = path[innerIdx] ?? { col: 3, row: 3 }
  return cellXY(col, row)
}

// tokens on outer ring cell
function tokensOnOuter(absPos: number): Token[] {
  return props.tokens.filter(
    t => !t.finished && t.ringPos >= 0 && t.ringPos < RING_SIZE && props.absolutePos(t) === absPos
  )
}

// tokens on inner path cell (innerIdx 0-4)
function tokensOnInner(player: 'red' | 'blue', innerIdx: number): Token[] {
  const ringIdx = RING_SIZE + innerIdx  // 25, 26, 27, 28, 29
  return props.tokens.filter(t => t.player === player && t.ringPos === ringIdx)
}

// finished tokens at center
const finishedTokens = computed(() => props.tokens.filter(t => t.finished))
const finishedRed = computed(() => finishedTokens.value.filter(t => t.player === 'red').length)
const finishedBlue = computed(() => finishedTokens.value.filter(t => t.player === 'blue').length)

const tokenColor = (t: Token) => t.player === 'red' ? '#e74c3c' : '#3498db'
const tokenStroke = (t: Token) => props.movableIds.has(t.id) ? '#fff' : 'rgba(255,255,255,0.3)'
const tokenStrokeW = (t: Token) => props.movableIds.has(t.id) ? 2.5 : 1

function renderTokensOnCell(tokens: Token[], cx: number, cy: number) {
  return tokens.map((t, i) => ({
    token: t,
    x: cx + (i - (tokens.length - 1) / 2) * 12,
    y: cy,
  }))
}

const outerCellsList = Array.from({ length: RING_SIZE }, (_, i) => i)
const innerIdxList = Array.from({ length: INNER_PATH }, (_, i) => i)

const centerXY = cellXY(3, 3)
const centerCX = centerXY.x + CELL / 2
const centerCY = centerXY.y + CELL / 2
</script>

<template>
  <div class="board-wrap">
    <svg :width="SVG_SIZE" :height="SVG_SIZE" class="board-svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- ── Background ── -->
      <rect width="100%" height="100%" rx="12" fill="#0f0f23" />

      <!-- ── Inner path background (red) ── -->
      <rect
        v-for="(cell, i) in redInnerPath.slice(0, INNER_PATH - 1)"
        :key="'ri-' + i"
        :x="cellXY(cell.col, cell.row).x"
        :y="cellXY(cell.col, cell.row).y"
        :width="CELL" :height="CELL" rx="6"
        fill="rgba(231,76,60,0.18)" stroke="rgba(231,76,60,0.4)" stroke-width="1.5"
      />
      <!-- ── Inner path background (blue) ── -->
      <rect
        v-for="(cell, i) in blueInnerPath.slice(0, INNER_PATH - 1)"
        :key="'bi-' + i"
        :x="cellXY(cell.col, cell.row).x"
        :y="cellXY(cell.col, cell.row).y"
        :width="CELL" :height="CELL" rx="6"
        fill="rgba(52,152,219,0.18)" stroke="rgba(52,152,219,0.4)" stroke-width="1.5"
      />

      <!-- ── Center finish cell ── -->
      <rect
        :x="centerXY.x" :y="centerXY.y"
        :width="CELL" :height="CELL" rx="8"
        fill="rgba(255,215,0,0.25)" stroke="gold" stroke-width="2.5"
        filter="url(#glow)"
      />
      <text :x="centerCX" :y="centerCY - 6" text-anchor="middle" dominant-baseline="middle" class="finish-label">终点</text>
      <text :x="centerCX" :y="centerCY + 13" text-anchor="middle" class="finish-score">
        <tspan fill="#e74c3c">{{ finishedRed }}</tspan>
        <tspan fill="#aaa">/</tspan>
        <tspan fill="#3498db">{{ finishedBlue }}</tspan>
      </text>

      <!-- ── Outer ring cells ── -->
      <g v-for="pos in outerCellsList" :key="'outer-' + pos">
        <rect
          :x="cellXY(outerCells[pos].col, outerCells[pos].row).x"
          :y="cellXY(outerCells[pos].col, outerCells[pos].row).y"
          :width="CELL" :height="CELL" rx="6"
          :class="[
            'outer-cell',
            pos === 0 ? 'cell-red-start' : ''
          ]"
          :style="pos === BLUE_START_OFFSET ? 'fill:rgba(52,152,219,0.3);stroke:#3498db;stroke-width:2' : ''"
        />
        <!-- cell number -->
        <text
          :x="cellXY(outerCells[pos].col, outerCells[pos].row).x + CELL / 2"
          :y="cellXY(outerCells[pos].col, outerCells[pos].row).y + CELL / 2"
          text-anchor="middle" dominant-baseline="middle" class="cell-num"
        >{{ pos + 1 }}</text>

        <!-- tokens on this outer cell -->
        <template v-for="item in renderTokensOnCell(
          tokensOnOuter(pos),
          cellXY(outerCells[pos].col, outerCells[pos].row).x + CELL / 2,
          cellXY(outerCells[pos].col, outerCells[pos].row).y + CELL / 2
        )" :key="item.token.id">
          <circle
            :cx="item.x" :cy="item.y" r="10"
            :fill="tokenColor(item.token)"
            :stroke="tokenStroke(item.token)"
            :stroke-width="tokenStrokeW(item.token)"
            :class="{ 'token-movable': movableIds.has(item.token.id) }"
            :style="{ cursor: movableIds.has(item.token.id) ? 'pointer' : 'default' }"
            @click="movableIds.has(item.token.id) && emit('move', item.token.id)"
          />
          <text
            :x="item.x" :y="item.y" text-anchor="middle" dominant-baseline="middle"
            class="token-icon" style="pointer-events:none"
          >✈</text>
        </template>
      </g>

      <!-- ── Red inner path cells + tokens ── -->
      <g v-for="idx in innerIdxList" :key="'red-inner-' + idx">
        <template v-for="item in renderTokensOnCell(
          tokensOnInner('red', idx),
          innerCellXY('red', idx).x + CELL / 2,
          innerCellXY('red', idx).y + CELL / 2
        )" :key="item.token.id">
          <circle
            :cx="item.x" :cy="item.y" r="10"
            :fill="tokenColor(item.token)"
            :stroke="tokenStroke(item.token)"
            :stroke-width="tokenStrokeW(item.token)"
            :class="{ 'token-movable': movableIds.has(item.token.id) }"
            :style="{ cursor: movableIds.has(item.token.id) ? 'pointer' : 'default' }"
            @click="movableIds.has(item.token.id) && emit('move', item.token.id)"
          />
          <text :x="item.x" :y="item.y" text-anchor="middle" dominant-baseline="middle"
            class="token-icon" style="pointer-events:none">✈</text>
        </template>
      </g>

      <!-- ── Blue inner path cells + tokens ── -->
      <g v-for="idx in innerIdxList" :key="'blue-inner-' + idx">
        <template v-for="item in renderTokensOnCell(
          tokensOnInner('blue', idx),
          innerCellXY('blue', idx).x + CELL / 2,
          innerCellXY('blue', idx).y + CELL / 2
        )" :key="item.token.id">
          <circle
            :cx="item.x" :cy="item.y" r="10"
            :fill="tokenColor(item.token)"
            :stroke="tokenStroke(item.token)"
            :stroke-width="tokenStrokeW(item.token)"
            :class="{ 'token-movable': movableIds.has(item.token.id) }"
            :style="{ cursor: movableIds.has(item.token.id) ? 'pointer' : 'default' }"
            @click="movableIds.has(item.token.id) && emit('move', item.token.id)"
          />
          <text :x="item.x" :y="item.y" text-anchor="middle" dominant-baseline="middle"
            class="token-icon" style="pointer-events:none">✈</text>
        </template>
      </g>

      <!-- ── Finished tokens at center ── -->
      <template v-for="(t, i) in finishedTokens" :key="'fin-' + t.id">
        <circle
          :cx="centerCX + (i % 2 === 0 ? -9 : 9)"
          :cy="centerCY + (i < 2 ? -9 : 9)"
          r="8"
          :fill="tokenColor(t)"
          stroke="gold" stroke-width="1.5"
        />
      </template>
    </svg>
  </div>
</template>

<style scoped>
.board-wrap { display: flex; align-items: center; justify-content: center; }
.board-svg { border-radius: 14px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); }
.outer-cell { fill: rgba(255,255,255,0.07); stroke: rgba(255,255,255,0.15); stroke-width: 1.5; }
.cell-red-start { fill: rgba(231,76,60,0.3) !important; stroke: #e74c3c !important; stroke-width: 2 !important; }
.cell-num { font-size: 11px; fill: rgba(255,255,255,0.35); pointer-events: none; user-select: none; }
.finish-label { font-size: 11px; font-weight: bold; fill: gold; pointer-events: none; }
.finish-score { font-size: 13px; font-weight: bold; pointer-events: none; }
.token-icon { font-size: 9px; fill: rgba(255,255,255,0.9); }
.token-movable { animation: pulse 0.9s infinite alternate; }
@keyframes pulse {
  from { filter: brightness(1); }
  to { filter: brightness(1.6) drop-shadow(0 0 5px #fff); }
}
</style>
