/**
 * @file useCountdown.js
 * @description 一个 Vue 组合式函数 (Composable)，提供一个倒计时功能。
 * @function useCountdown
 * @param {number} [duration=60] - 倒计时的初始秒数。
 * @returns {{timeLeft: Ref<number>, isCounting: Ref<boolean>, start: Function}} 包含 timeLeft, isCounting, start 方法的对象。
 * @property {Ref<number>} timeLeft - 响应式的剩余秒数。
 * @property {Ref<boolean>} isCounting - 响应式的是否正在倒计时的布尔值。
 * @property {Function} start - 启动倒计时的函数。
 */
import { ref, onBeforeUnmount } from 'vue'

export function useCountdown(duration = 60) {
  // 剩余时间
  const timeLeft = ref(duration)
  // 是否正在倒计时
  const isCounting = ref(false)
  // 定时器实例
  let timer = null

  /**
   * @function start
   * @description 开始倒计时。如果已在倒计时中，则不执行任何操作。
   * @returns {void}
   */
  const start = () => {
    if (isCounting.value) return // 防止定时器多开
    isCounting.value = true
    timeLeft.value = duration // 重置倒计时时间
    countdown() // 启动倒计时逻辑
  }

  /**
   * @function countdown
   * @description 倒计时的核心逻辑。每秒递减 timeLeft，直到归零。
   * @private
   * @returns {void}
   */
  const countdown = () => {
    if (timeLeft.value > 0) {
      timer = setTimeout(() => {
        timeLeft.value--
        countdown() // 递归调用以继续倒计时
      }, 1000)
    } else {
      isCounting.value = false // 倒计时结束
    }
  }

  // 组件卸载前清除定时器，防止内存泄漏
  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return {
    timeLeft, // 暴露剩余时间
    isCounting, // 暴露倒计时状态
    start // 暴露开始倒计时的方法
  }
}
