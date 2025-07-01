<script setup>
import { watch, onUnmounted, onMounted } from 'vue'
import { useUserStore, useChatStore, useAppStore } from '@/stores'
import { connectSocket, disconnectSocket } from '@/services/socketService'
import { ElIcon } from 'element-plus' // ✅ 导入 ElIcon
import { Loading } from '@element-plus/icons-vue' // ✅ 导入 Loading 图标组件

const userStore = useUserStore()
const chatStore = useChatStore()
const appStore = useAppStore()

watch(
  () => userStore.token,
  (newToken, oldToken) => {
    console.log(`token 已改变 ${oldToken} => ${newToken}`)
    if (newToken && userStore.isLoggedIn) {
      console.log('用户已登陆或 token 已刷新，尝试连接 WebSocket...')
      connectSocket()
      chatStore.getConversations()
    } else if (!newToken && !userStore.isLoggedIn) {
      console.log(`用户已登出或 token 已清除，断开 WebSocket 连接...`)
      disconnectSocket()
    }
  },
  {
    immediate: true
  }
)

onUnmounted(() => {
  console.log('正在断开 WebSocket 连接...')
  disconnectSocket()
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
      style="
        background-color: transparent !important; /* 核心：对话框背景完全透明 */
        box-shadow: none !important; /* 移除阴影 */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0; /* 移除内边距 */
        z-index: 99999; /* 确保在最上层 */
        position: fixed; /* 确保定位 */
        top: 50%; /* 垂直居中 */
        left: 50%; /* 水平居中 */
        transform: translate(-50%, -50%); /* 精确居中 */
        pointer-events: auto; /* 确保可以捕获事件 */
      "
      class="minimal-loading-dialog"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: transparent; /* 确保内容区背景也透明 */
          color: #fff; /* 文字颜色，如果下方有背景，文字用白色更明显 */
        "
      >
        <el-icon class="is-loading" style="font-size: 50px; color: #ff9100">
          <Loading />
        </el-icon>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped></style>
