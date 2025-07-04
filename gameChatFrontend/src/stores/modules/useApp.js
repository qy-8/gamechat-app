/**
 * @file stores/modules/appStore.js
 * @description Pinia Store，用于管理应用程序的全局加载状态。
 * 该 Store 通过跟踪正在进行的异步请求数量来控制一个全局加载指示器。
 * @module AppStore
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * @function useAppStore
 * @description Pinia Store，用于管理应用程序的全局加载状态。
 * 它通过维护一个请求计数器来判断是否显示全局加载动画。
 * @returns {{
 * isLoading: Ref<boolean>,
 * startLoading: Function,
 * stopLoading: Function
 * }}
 * @property {Ref<boolean>} isLoading - 响应式布尔值，表示应用程序当前是否处于加载状态。
 * @property {Function} startLoading - 递增加载计数，并根据计数显示加载动画。
 * @property {Function} stopLoading - 递减加载计数，并根据计数隐藏加载动画。
 */
export const useAppStore = defineStore('app', () => {
  // --- 状态 (State) ---
  /**
   * @type {Ref<number>}
   * @description 记录当前正在进行的异步请求数量。
   */
  const globalLoadingCount = ref(0)
  /**
   * @type {Ref<boolean>}
   * @description 表示应用程序是否处于加载状态（当 `globalLoadingCount > 0` 时为 `true`）。
   */
  const isLoading = ref(false)

  // --- 操作 (Actions) ---

  /**
   * @function startLoading
   * @description 递增加载计数器。
   * 如果计数器从 0 变为 1，则将 `isLoading` 设置为 `true`，显示全局加载动画。
   * @returns {void}
   */
  function startLoading() {
    globalLoadingCount.value++
    if (globalLoadingCount.value > 0) {
      isLoading.value = true
    }
  }

  /**
   * @function stopLoading
   * @description 递减加载计数器。
   * 如果计数器变为 0 或更小，则将 `isLoading` 设置为 `false`，隐藏全局加载动画。
   * 同时确保计数器不会变为负数。通常在异步请求完成后调用。
   * @returns {void}
   */
  function stopLoading() {
    globalLoadingCount.value--
    if (globalLoadingCount.value <= 0) {
      globalLoadingCount.value = 0 // 防止计数器出现负数
      isLoading.value = false
    }
  }

  // --- 返回 Store 的状态和操作 ---
  return {
    isLoading,
    startLoading,
    stopLoading
  }
})
