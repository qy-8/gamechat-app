/**
 * @file stores/modules/themeStore.js
 * @description Pinia Store，用于管理应用程序的亮/暗主题模式。
 * 该 Store 会自动同步主题状态到 `<html>` 元素的 class 列表，并支持持久化。
 * @module ThemeStore
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * @function useThemeStore
 * @description Pinia Store，用于管理应用程序的亮/暗主题模式。
 * 它可以检测系统偏好，支持手动切换主题，并持久化主题状态。
 * @returns {{
 * isDarkMode: Ref<boolean>,
 * toggleTheme: Function,
 * initTheme: Function
 * }}
 * @property {Ref<boolean>} isDarkMode - 响应式布尔值，表示当前是否处于黑暗模式。
 * @property {Function} toggleTheme - 切换 `isDarkMode` 状态的函数。
 * @property {Function} initTheme - 初始化主题模式的函数，会检查 localStorage 和系统偏好。
 */
export const useThemeStore = defineStore(
  'theme',
  () => {
    // --- 状态 (State) ---
    /**
     * @type {Ref<boolean>}
     * @description 当前是否处于黑暗模式。
     */
    const isDarkMode = ref(false)

    // --- 监听器 (Watchers) ---

    /**
     * @watch isDarkMode
     * @description 监听 `isDarkMode` 状态的变化，并自动切换 `<html>` 元素的 'dark' class。
     * 这使得 CSS 可以根据这个 class 应用不同的主题样式。
     * `immediate: true` 确保在 Store 初始化时立即执行一次。
     * @param {boolean} val - `isDarkMode` 的新值。
     * @returns {void}
     */
    watch(
      isDarkMode,
      (val) => {
        document.documentElement.classList.toggle('dark', val)
      },
      { immediate: true }
    )

    // --- 操作 (Actions) ---

    /**
     * @function toggleTheme
     * @description 切换 `isDarkMode` 状态。
     * 如果当前是亮模式，则切换到暗模式；反之亦然。
     * @returns {void}
     */
    function toggleTheme() {
      isDarkMode.value = !isDarkMode.value
    }

    /**
     * @function initTheme
     * @description 初始化主题模式。
     * 如果 `localStorage` 中没有 'theme' 的值，则会检查用户的系统颜色偏好（ prefers-color-scheme: dark ）来设置初始主题。
     * 如果 `persist: true` 已启用，此函数通常会在 Pinia 恢复状态后运行。
     * @returns {void}
     */
    function initTheme() {
      // 检查 localStorage 是否有主题设置，如果没有则根据系统偏好设置
      if (
        typeof localStorage !== 'undefined' &&
        !localStorage.getItem('theme') // Pinia persist 会将 'theme' 存储在 'theme' key 下
      ) {
        isDarkMode.value = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches // 根据系统偏好设置初始模式
      }
    }

    // --- 返回 Store 的状态和操作 ---
    return { isDarkMode, toggleTheme, initTheme }
  },
  {
    // Pinia 持久化配置，将 Store 状态保存到 localStorage
    persist: true // 自动将 Store 状态持久化到本地存储
  }
)
