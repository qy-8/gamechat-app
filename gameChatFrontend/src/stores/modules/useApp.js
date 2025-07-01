import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const globalLoadingCount = ref(0) // 记录正在进行的请求数量
  const isLoading = ref(false)

  // 递增加载计数，如果从 0 变为 1，则显示加载动画
  function startLoading() {
    globalLoadingCount.value++
    if (globalLoadingCount.value > 0) {
      isLoading.value = true
    }
  }

  // 递减加载计数，如果变为 0，则隐藏加载动画
  function stopLoading() {
    globalLoadingCount.value--
    if (globalLoadingCount.value <= 0) {
      globalLoadingCount.value = 0 // 防止负数
      isLoading.value = false
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading
  }
})
