<script setup>
import NavigationSidebar from '../components/NavigationSidebar.vue'
import ConversationView from '../components/ConversationView.vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { getUserInfo } from '../api/user'
import { useUserStore, useFriendStore, useGroupStore } from '../stores'
import { getSocket } from '@/services/socketService'
import { h } from 'vue'
import { ElNotification } from 'element-plus'
import emitter from '../services/eventBus'

const groupList = ref([])
const userStore = useUserStore()
const groupStore = useGroupStore()
const friendStore = useFriendStore()
const phoneNum = ref('')

const getPersonalInfo = async () => {
  const response = await getUserInfo()
  const { username, _id, avatar, phoneNumber } = response.data
  const necessaryData = {
    username,
    userId: _id,
    avatar
  }
  userStore.setUserInfo(necessaryData)
  phoneNum.value = phoneNumber
}

const showNotification = ({ title, message }) => {
  ElNotification({
    title,
    dangerouslyUseHTMLString: true,
    message: h('span', { innerHTML: message }),
    duration: 5000, // 5秒后自动关闭
    position: 'top-right'
  })
}

onMounted(() => {
  const socket = getSocket()

  groupStore.setGroups()
  getPersonalInfo()

  emitter.on('show-notification', showNotification)
})

onUnmounted(() => {
  emitter.off('show-notification', showNotification)
})
</script>

<template>
  <div class="container">
    <NavigationSidebar :phoneNum="phoneNum" />
    <router-view></router-view>
    <ConversationView class="conversation-view" />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.conversation-view {
  flex: 1;
  min-width: 0;
}
</style>
