<template>
  <div class="user-badge" @click="handleClick">
    <el-avatar :size="props.size" :src="props.avatar">
      {{ props.username?.charAt(0) }}
    </el-avatar>
    <span class="username">
      {{ props.username }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  avatar: {
    type: String,
    default: '/images/defaultUserAvatar.png'
  },
  username: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 40 // 默认大小为 40px
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
.user-badge {
  /* width: 100%; */
  height: 100%;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 4px;
  border-radius: 6px;
}

.username {
  margin-left: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
</style>
