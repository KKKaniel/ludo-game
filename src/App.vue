<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from './components/GameBoard.vue'
import SetupScreen from './components/SetupScreen.vue'

const started = ref(false)
const redName = ref('玩家一')
const blueName = ref('玩家二')

function onStart(r: string, b: string) {
  redName.value = r
  blueName.value = b
  started.value = true
}
</script>

<template>
  <div class="app">
    <SetupScreen v-if="!started" @start="onStart" />
    <GameBoard v-else :red-name="redName" :blue-name="blueName" />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
