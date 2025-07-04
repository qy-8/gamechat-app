<script setup>
/**
 * @file LottieAnimation.vue
 * @description 一个封装了 Lottie 动画的 Vue 组件，支持加载本地或远程动画数据。
 * @component LottieAnimation
 * @property {object | string} animationData - Lottie 动画的 JSON 数据对象或文件的 URL。
 * @property {boolean} [loop=true] - 动画是否循环播放。
 * @property {boolean} [autoplay=true] - 动画是否自动播放。
 */
import lottie from 'lottie-web'
import { onMounted, ref, onUnmounted, watch } from 'vue'

// 动画容器的引用
const container = ref(null)
// Lottie 动画实例
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

  // 销毁现有动画实例，防止重复渲染和内存泄漏
  if (animationInstance.value) {
    animationInstance.value.destroy()
    container.value.innerHTML = '' // 清空容器内容
  }

  let data = props.animationData
  if (typeof data === 'string') {
    const res = await fetch(data)
    data = await res.json()
  }

  // 加载 Lottie 动画
  animationInstance.value = lottie.loadAnimation({
    container: container.value, // 渲染动画的 DOM 元素
    renderer: 'svg', // 渲染器类型
    loop: props.loop, // 是否循环
    autoplay: props.autoplay, // 是否自动播放
    animationData: data // 动画数据
  })
}

// 组件挂载时加载动画
onMounted(() => {
  loadAnimation()
})

// 组件卸载时销毁动画实例
onUnmounted(() => {
  if (animationInstance.value) {
    animationInstance.value.destroy()
  }
})

// 监听 animationData 变化，重新加载动画
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
/*------------------------------------*\
 # 动画容器样式
 # 描述：定义 Lottie 动画容器的尺寸。
\*------------------------------------*/
.click-animation {
  width: 100px;
  height: 100px;
}
</style>
