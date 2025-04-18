import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDarkMode = ref(false)

    // 监视 isDarkMode 并自动切换主题到HTML
    watch(
      isDarkMode,
      (val) => {
        document.documentElement.classList.toggle('dark', val)
      },
      { immediate: true }
    )

    // 切换 isDarkMode 值
    function toggleTheme() {
      isDarkMode.value = !isDarkMode.value
    }

    // 如果 localStorage 没有 isDarkMode 的值，检查其系统偏好
    function initTheme() {
      if (
        typeof localStorage !== 'undefined' &&
        !localStorage.getItem('theme')
      ) {
        isDarkMode.value = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
      }
    }

    return { isDarkMode, toggleTheme, initTheme }
  },
  {
    persist: true
  }
)
