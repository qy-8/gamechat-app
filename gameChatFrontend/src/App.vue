<script setup>
import { watch, onUnmounted, onMounted } from 'vue'
import { useUserStore, useChatStore, useAppStore } from '@/stores'
import { connectSocket, disconnectSocket } from '@/services/socketService'
import { ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const userStore = useUserStore()
const chatStore = useChatStore()
const appStore = useAppStore()

watch(
  () => userStore.token,
  (newToken, oldToken) => {
    if (newToken && userStore.isLoggedIn) {
      connectSocket()
      chatStore.getConversations()
    } else if (!newToken && !userStore.isLoggedIn) {
      disconnectSocket()
    }
  },
  {
    immediate: true
  }
)

onUnmounted(() => {
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
        background-color: transparent !important;
        box-shadow: none !important;
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
      "
      class="minimal-loading-dialog"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          color: #fff;
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
