<script setup>
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
  }
})

const imageLoadError = ref(false)

const actualSrc = computed(() => {
  if (imageLoadError.value || !props.src) {
    return '/images/defaultGroupAvatar.png'
  }
  return props.src
})

const wrapperStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

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
    />
  </div>
</template>

<style lang="scss" scoped>
.avatar-container {
  border-radius: 10px;
  overflow: hidden;
  // display: inline-block;
  background-color: #eee;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
