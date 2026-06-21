<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" :width="size" :height="size">
    <!-- 腄部 -->
    <circle cx="50" cy="42" r="28" fill="#FFDBA4"/>
    <!-- 头发 -->
    <ellipse cx="50" cy="16" rx="26" ry="10" fill="#2C1810"/>
    <rect x="24" y="16" width="52" height="10" fill="#2C1810"/>
    <!-- 眉毛 -->
    <rect x="32" y="34" width="12" height="4" rx="2" fill="#2C1810"/>
    <rect x="56" y="34" width="12" height="4" rx="2" fill="#2C1810"/>
    <!-- 眼睛 -->
    <circle cx="38" cy="44" r="6" fill="white"/>
    <circle cx="62" cy="44" r="6" fill="white"/>
    <circle cx="39" cy="45" r="3.5" fill="#1a1a1a"/>
    <circle cx="63" cy="45" r="3.5" fill="#1a1a1a"/>
    <circle cx="40" cy="43" r="1.2" fill="white"/>
    <circle cx="64" cy="43" r="1.2" fill="white"/>
    <!-- 鼻子 -->
    <ellipse cx="50" cy="52" rx="5" ry="3" fill="#F0C080"/>
    <circle cx="47" cy="52" r="1.5" fill="#c0885a"/>
    <circle cx="53" cy="52" r="1.5" fill="#c0885a"/>
    <!-- 咒害的小调皮嘴巴 -->
    <path d="M38 61 Q50 70 62 61" stroke="#c0885a" stroke-width="2.5" fill="#FF9999" stroke-linecap="round"/>
    <path d="M44 64 Q50 68 56 64" fill="#cc4444"/>
    <!-- 舌头 -->
    <ellipse cx="50" cy="66" rx="5" ry="3" fill="#FF6666"/>
    <!-- 腞红 -->
    <ellipse cx="30" cy="56" rx="6" ry="4" fill="#FFB6C1" opacity="0.7"/>
    <ellipse cx="70" cy="56" rx="6" ry="4" fill="#FFB6C1" opacity="0.7"/>
    <!-- 耳朵 -->
    <circle cx="22" cy="44" r="8" fill="#FFDBA4"/>
    <circle cx="78" cy="44" r="8" fill="#FFDBA4"/>
    <!-- 身体红色衬衫 -->
    <rect x="26" y="69" width="48" height="30" rx="8" fill="#E74C3C"/>
    <!-- 袆衫领子 -->
    <path d="M44 70 L50 79 L56 70" fill="white"/>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ size?: number }>()
const { size = 40 } = defineProps<{ size?: number }>()
</script>
