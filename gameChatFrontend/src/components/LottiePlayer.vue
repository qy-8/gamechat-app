<script setup>
import lottie from 'lottie-web'
import { onMounted, ref, onUnmounted, watch } from 'vue'

const container = ref(null)
const animationInstance = ref(null)

const props = defineProps({
  animationData: {
    type: [Object, String],
    required: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: true
  }
})

// 加载动画
const loadAnimation = async () => {
  if (!container.value) return

  // 销毁已有动画，防止重复渲染
  if (animationInstance.value) {
    animationInstance.value.destroy()
    container.value.innerHTML = ''
  }

  let data = props.animationData
  if (typeof data === 'string') {
    const res = await fetch(data)
    data = await res.json()
  }

  animationInstance.value = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: data
  })
}

onMounted(() => {
  loadAnimation()
})

onUnmounted(() => {
  if (animationInstance.value) {
    animationInstance.value.destroy()
  }
})

// 🔁 监听 animationData 变化（如果你后续可能动态切换动画）
watch(
  () => props.animationData,
  () => {
    loadAnimation()
  }
)
</script>

<template>
  <div ref="container" class="click-animation"></div>
</template>

<style lang="scss" scoped>
.click-animation {
  width: 100px;
  height: 100px;
}
</style>
