<script setup>
/**
 * @file ThemeToggle.vue
 * @description 应用程序主题切换组件，用于在明亮模式和黑暗模式之间切换。
 * @component ThemeToggle
 */
import { useThemeStore } from '@/stores/modules/themeStore'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
const { toggleTheme } = themeStore
</script>

<template>
  <button @click="toggleTheme">
    {{ isDarkMode ? '明亮模式' : '黑暗模式' }}
  </button>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 按钮通用样式
 # 描述：定义主题切换按钮的行高和边框。
\*------------------------------------*/
button {
  line-height: 1.5;
  border: none;
}
</style>
