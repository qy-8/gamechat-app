<script setup>
/**
 * @file SearchInput.vue
 * @description 一个带有防抖功能的搜索输入框组件，封装了 Element Plus 的 ElInput。
 * @component SearchInput
 * @property {string} placeholder - 输入框的占位文本。
 * @emits search - 当用户输入停止500毫秒后触发，并带有搜索关键词。
 * @emits clear - 当用户点击清空按钮时触发。
 */
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索'
  }
})

const emit = defineEmits(['search', 'clear'])

// 搜索框的绑定值
const query = ref('')
// 防抖计时器变量
let debounceTimer = null

/**
 * 处理输入事件，并实现防抖功能。
 * 在用户停止输入500毫秒后，触发 'search' 事件。
 */
const onInput = () => {
  // 清除之前的计时器，防止重复触发
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 设置新的计时器，在500毫秒后发送搜索词
  debounceTimer = setTimeout(() => {
    emit('search', query.value)
  }, 500)
}

/**
 * 处理输入框清空事件。
 * 触发 'clear' 事件。
 */
const handleClear = () => {
  emit('clear')
}
</script>
<template>
  <el-input
    :placeholder="placeholder"
    v-model="query"
    @input="onInput"
    clearable
    @clear="handleClear"
    :suffix-icon="Search"
  />
</template>
