<script setup>
/**
 * @file App.vue
 * @description 应用程序的根组件。
 * 负责初始化 Socket.IO 连接、根据用户认证状态管理连接生命周期，
 * 并展示一个全局加载指示器。所有其他视图和组件都渲染在这个组件内部。
 * @component App
 */
import { watch, onUnmounted, onMounted } from 'vue'
import { useUserStore, useChatStore, useAppStore } from '@/stores'
import { connectSocket, disconnectSocket } from '@/services/socketService'
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const userStore = useUserStore()
const chatStore = useChatStore()
const appStore = useAppStore()

/**
 * @watch userStore.token
 * @description 监听用户认证 token 的变化。
 * - 如果用户登录 (token 存在且 `isLoggedIn` 为 true)，则连接 Socket.IO 并获取会话列表。
 * - 如果用户登出 (token 不存在且 `isLoggedIn` 为 false)，则断开 Socket.IO 连接。
 * `immediate: true` 确保在组件初始化时立即执行一次监听。
 * @param {string} newToken - token 的新值。
 * @param {string} oldToken - token 的旧值。
 * @returns {void}
 */
watch(
  () => userStore.token,
  (newToken, oldToken) => {
    if (newToken && userStore.isLoggedIn) {
      // 如果有 token 且用户已登录，则连接 Socket 并获取会话
      connectSocket()
      chatStore.getConversations()
    } else if (!newToken && !userStore.isLoggedIn) {
      // 如果没有 token 且用户未登录，则断开 Socket 连接
      disconnectSocket()
    }
  },
  {
    immediate: true // 立即执行一次监听，处理初次加载时的认证状态
  }
)

/**
 * @lifecycle onUnmounted
 * @description 组件卸载时执行的逻辑。
 * 断开 Socket.IO 连接，清理资源。
 * @returns {void}
 */
onUnmounted(() => {
  disconnectSocket() // 在应用根组件卸载时断开 Socket 连接
})
</script>

<template>
  <div>
    <router-view />

    <el-dialog
      v-model="appStore.isLoading"
      :close-on-click-modal="false"
      :show-close="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      center
      width="unset"
      style="background-color: transparent"
      class="minimal-loading-dialog"
    >
      <div class="loading-content-dialog">
        <el-icon class="is-loading loading-icon-style">
          <Loading />
        </el-icon>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/*------------------------------------*\
 # 全局加载对话框样式
 # 描述：自定义 Element Plus 对话框作为全局加载指示器的外观和行为。
\*------------------------------------*/
.minimal-loading-dialog {
  // 核心：确保 el-dialog 本身没有背景和阴影
  ::v-deep(.el-dialog) {
    box-shadow: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 99999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: auto;
  }
}

/*------------------------------------*\
 # 加载动画内容包裹器样式
 # 描述：定义加载图标和文本的居中布局。
\*------------------------------------*/
.loading-content-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #fff;
}

/*------------------------------------*\
 # 加载图标样式
 # 描述：自定义加载图标的尺寸和颜色。
\*------------------------------------*/
.loading-icon-style {
  font-size: 50px;
  color: var(--el-color-primary); /* 使用主题色 */
}
</style>
