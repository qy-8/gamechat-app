import { ref, onBeforeUnmount } from 'vue'

export function useCountdown(duration = 60) {
  const timeLeft = ref(duration)
  const isCounting = ref(false)
  let timer = null

  const start = () => {
    if (isCounting.value) return // 防止定时器多开
    isCounting.value = true
    timeLeft.value = duration
    countdown()
  }

  const countdown = () => {
    if (timeLeft.value > 0) {
      timer = setTimeout(() => {
        timeLeft.value--
        countdown()
      }, 1000)
    } else {
      isCounting.value = false
    }
  }

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return {
    timeLeft,
    isCounting,
    start
  }
}
