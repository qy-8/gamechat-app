<script setup>
import UserAvatar from './UserAvatar.vue'
import dayjs from 'dayjs'

// 定义组件接收的 Props
const props = defineProps({
  avatar: String,
  name: String,
  timestamp: String
})

// 定义组件可以触发的事件
const emit = defineEmits(['accept', 'decline'])

const formatTimeAgo = (ts) => {
  if (!ts) return ''
  return dayjs(ts).fromNow()
}
</script>

<template>
  <el-card shadow="hover">
    <div class="request-container">
      <UserAvatar :src="avatar" class="user-avatar" />

      <div class="request-info-container">
        <div class="user-info-container">
          <div class="name">{{ name }}</div>
          <div class="request-date">
            {{ formatTimeAgo(timestamp) }}
          </div>
        </div>
        <div class="option-container">
          <el-button class="accept" @click="emit('accept')">同意</el-button>
          <el-button class="decline" @click="emit('decline')">拒绝</el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.el-card {
  margin-bottom: 10px;
}
.request-container {
  display: flex;
  align-items: center;
}
.user-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}
.request-info-container {
  width: 100%;
}
.user-info-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.request-date {
  font-size: 12px;
  color: var(--el-text-color-primary);
}
.request-container .user-avatar {
  margin-right: 20px;
}
.name {
  font-weight: bold;
}

.option-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.option-container .el-button {
  width: 46%;
  height: 26px;
}

.option-container .el-button:hover {
  border: 1px solid var(--el-btn-hover-border-color);
}

.accept {
  border: 1px solid var(--el-text-color-primary);
}
</style>
