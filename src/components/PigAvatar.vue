<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" :width="size" :height="size">
    <!-- 头盔主体 -->
    <ellipse cx="50" cy="38" rx="32" ry="28" fill="#E74C3C"/>
    <!-- 头盔高光 -->
    <ellipse cx="38" cy="22" rx="10" ry="6" fill="#FF6B6B" opacity="0.5"/>
    <!-- 头盔护目镜框 -->
    <rect x="18" y="32" width="64" height="22" rx="11" fill="#2C3E50"/>
    <rect x="20" y="34" width="60" height="18" rx="9" fill="#3498DB" opacity="0.85"/>
    <!-- 护目镜高光 -->
    <ellipse cx="36" cy="40" rx="10" ry="5" fill="white" opacity="0.25"/>
    <ellipse cx="64" cy="40" rx="10" ry="5" fill="white" opacity="0.25"/>
    <!-- 眼睛 -->
    <circle cx="36" cy="43" r="7" fill="white"/>
    <circle cx="64" cy="43" r="7" fill="white"/>
    <circle cx="37" cy="44" r="4" fill="#2C1810"/>
    <circle cx="65" cy="44" r="4" fill="#2C1810"/>
    <circle cx="38" cy="42" r="1.5" fill="white"/>
    <circle cx="66" cy="42" r="1.5" fill="white"/>
    <!-- 猪鼻 -->
    <ellipse cx="50" cy="60" rx="12" ry="9" fill="#FFDBA4"/>
    <circle cx="45" cy="61" r="3.5" fill="#c0885a"/>
    <circle cx="55" cy="61" r="3.5" fill="#c0885a"/>
    <!-- 唔巴 -->
    <path d="M40 70 Q50 78 60 70" stroke="#c0885a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- 腞红 -->
    <ellipse cx="28" cy="62" rx="6" ry="4" fill="#FFB6C1" opacity="0.6"/>
    <ellipse cx="72" cy="62" rx="6" ry="4" fill="#FFB6C1" opacity="0.6"/>
    <!-- 头盔角 -->
    <polygon points="20,28 13,8 30,22" fill="#F39C12"/>
    <polygon points="80,28 87,8 70,22" fill="#F39C12"/>
    <!-- 身体红色战衣 -->
    <rect x="26" y="78" width="48" height="22" rx="8" fill="#E74C3C"/>
    <!-- 胸前D徽章 -->
    <circle cx="50" cy="89" r="8" fill="#F39C12"/>
    <text x="50" y="93" text-anchor="middle" font-size="11" font-weight="bold" fill="#E74C3C">D</text>
  </svg>
</template>

<script setup lang="ts">
const { size = 40 } = defineProps<{ size?: number }>()
</script>
