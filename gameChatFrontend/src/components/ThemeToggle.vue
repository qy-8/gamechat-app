<script setup>
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
button {
  line-height: 1.5;
  border: none;
}
</style>
