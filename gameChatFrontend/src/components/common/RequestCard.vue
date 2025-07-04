<script setup>
/**
 * @file FriendRequestCard.vue
 * @description 显示单个好友请求的卡片组件，包含用户头像、名称、请求时间及接受/拒绝按钮。
 * @component FriendRequestCard
 * @property {string} avatar - 请求用户的头像 URL。
 * @property {string} name - 请求用户的名称。
 * @property {string} timestamp - 请求发生的时间戳。
 * @emits accept - 当用户点击“同意”按钮时触发。
 * @emits decline - 当用户点击“拒绝”按钮时触发。
 */
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

// 格式化时间戳，显示为“多久之前”
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
/*------------------------------------*\
 # 卡片容器样式
 # 描述：设置好友请求卡片的整体外观和间距。
\*------------------------------------*/
.el-card {
  margin-bottom: 10px;
}

/*------------------------------------*\
 # 请求内容布局
 # 描述：定义卡片内部头像和信息区域的弹性布局。
\*------------------------------------*/
.request-container {
  display: flex;
  align-items: center;
}

/*------------------------------------*\
 # 用户头像样式
 # 描述：设置头像组件的右侧间距和防止收缩。
\*------------------------------------*/
.user-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

/*------------------------------------*\
 # 请求信息区域
 # 描述：确保信息容器占据可用宽度。
\*------------------------------------*/
.request-info-container {
  width: 100%;
}

/*------------------------------------*\
 # 用户名称和日期布局
 # 描述：设置用户信息（名称和日期）的对齐方式。
\*------------------------------------*/
.user-info-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/*------------------------------------*\
 # 请求日期文本样式
 # 描述：定义时间戳的字体大小和颜色。
\*------------------------------------*/
.request-date {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

/*------------------------------------*\
 # 头像和信息容器间距（重复选择器，优化可考虑合并）
 # 描述：调整头像和信息容器之间的右侧间距。
\*------------------------------------*/
.request-container .user-avatar {
  margin-right: 20px;
}

/*------------------------------------*\
 # 用户名称样式
 # 描述：设置用户名称的字体加粗。
\*------------------------------------*/
.name {
  font-weight: bold;
}

/*------------------------------------*\
 # 操作按钮容器
 # 描述：定义同意/拒绝按钮的布局和间距。
\*------------------------------------*/
.option-container {
  display: flex;
  justify-content: flex-end; /* 按钮靠右对齐 */
  gap: 10px; /* 按钮之间间距 */
  margin-top: 10px;
}

/*------------------------------------*\
 # 操作按钮通用样式
 # 描述：设置按钮的宽度和高度。
\*------------------------------------*/
.option-container .el-button {
  width: 46%;
  height: 26px;
}

/*------------------------------------*\
 # 操作按钮悬停效果
 # 描述：定义按钮悬停时的边框颜色。
\*------------------------------------*/
.option-container .el-button:hover {
  border: 1px solid var(--el-btn-hover-border-color);
}

/*------------------------------------*\
 # “同意”按钮特定样式
 # 描述：设置“同意”按钮的边框颜色。
\*------------------------------------*/
.accept {
  border: 1px solid var(--el-text-color-primary);
}
</style>
