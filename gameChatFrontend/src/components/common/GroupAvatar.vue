<script setup>
/**
 * @file GroupAvatar.vue
 * @description 一个可自定义大小和支持图片加载失败回退的群组头像组件。
 * @component GroupAvatar
 * @property {string} src - 头像图片的URL，默认为一个默认群组头像。
 * @property {string} alt - 图片的alt文本，用于辅助功能。
 * @property {number} size - 头像的宽度和高度（像素），默认为50px。
 * @property {boolean} lazy - 是否开启图片的原生懒加载。
 */
import { computed, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: '/images/defaultGroupAvatar.png'
  },
  alt: {
    type: String,
    default: '群组头像'
  },
  size: {
    type: Number,
    default: 50
  },
  lazy: {
    type: Boolean,
    default: false // 默认不懒加载
  }
})

// 用于标记图片加载是否出错的状态
const imageLoadError = ref(false)

// 根据图片加载状态和props.src计算实际要显示的图片源
const actualSrc = computed(() => {
  if (imageLoadError.value || !props.src) {
    return '/images/defaultGroupAvatar.png'
  }
  return props.src
})

// 根据props.size计算头像容器的样式
const wrapperStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

// 处理图片加载失败的函数，将imageLoadError设置为true以显示默认头像
const handleImageError = () => {
  imageLoadError.value = true
}
</script>

<template>
  <div class="avatar-container" :style="wrapperStyle">
    <img
      :src="actualSrc"
      :alt="alt"
      class="avatar-image"
      @error="handleImageError"
      :loading="lazy ? 'lazy' : 'eager'"
    />
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 头像容器样式
 # 描述：定义头像图片的外部容器，包括圆角和背景。
\*------------------------------------*/

.avatar-container {
  border-radius: 10px;
  overflow: hidden;
  background-color: #eee;
}

/*------------------------------------*\
 # 头像图片样式
 # 描述：设置头像图片在容器内的显示方式，确保填充并裁剪。
\*------------------------------------*/

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
