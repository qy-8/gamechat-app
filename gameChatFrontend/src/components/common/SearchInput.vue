<template>
  <el-input
    :placeholder="placeholder"
    v-model="query"
    @input="onInput"
    clearable
    :suffix-icon="Search"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索'
  }
})

const emit = defineEmits(['search'])

const query = ref('')
let debounceTimer = null

const onInput = () => {
  // 清除计时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 创建一个新的计时器，500毫秒后执行
  debounceTimer = setTimeout(() => {
    // 用户停止输入，计时器触发，通过 emit 把最终的搜索词发送给父组件
    emit('search', query.value)
  }, 500)
}
</script>

<style scoped></style>
