<script setup>
import { watch, onUnmounted, onMounted } from 'vue'
import { useUserStore, useChatStore } from '@/stores'
import { connectSocket, disconnectSocket } from '@/services/socketService'

const userStore = useUserStore()
const chatStore = useChatStore()

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
  </div>
</template>

<style scoped></style>
