<script setup>
import NavigationSidebar from '../components/NavigationSidebar.vue'
import ConversationView from '../components/ConversationView.vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { getUserInfo } from '../api/user'
import { useUserStore, useFriendStore, useGroupStore } from '../stores'
import { getSocket } from '@/services/socketService'
import { h } from 'vue'
import { ElNotification } from 'element-plus'

const groupList = ref([])
const userStore = useUserStore()
const groupStore = useGroupStore()
const friendStore = useFriendStore()
const phoneNum = ref('')

const getPersonalInfo = async () => {
  const response = await getUserInfo()
  // console.log(response)
  const { username, _id, avatar, phoneNumber } = response.data
  const necessaryData = {
    username,
    userId: _id,
    avatar
  }
  userStore.setUserInfo(necessaryData)
  phoneNum.value = phoneNumber
}

onMounted(() => {
  groupStore.setGroups()
  getPersonalInfo()
})

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.on('new-friend-request', handleNewFriendRequest)
    socket.on('new_group_invitation', handleNewGroupInvitation)
  }
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('new_friend_request', handleNewFriendRequest)
    socket.off('new_group_invitation', handleNewGroupInvitation)
  }
})

const handleNewFriendRequest = (requestData) => {
  console.log('Socket 收到新的好友请求，准备更新 store:', requestData)
  friendStore.handleNewRequest(requestData)

  ElNotification({
    title: '新的好友请求',
    message: h(
      'span',
      null,
      `用户 ${requestData.requester.username} 想添加你为好友。`
    ),
    duration: 5000, // 5秒后自动关闭
    position: 'top-right'
  })
}

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('new_friend_request', handleNewFriendRequest)
  }
})

const handleNewGroupInvitation = (requestData) => {
  console.log('Socket 收到新的群聊邀请，准备更新 store:', requestData)
  groupStore.handleNewRequest(requestData)

  ElNotification({
    title: '新的好友请求',
    message: h(
      'span',
      null,
      `用户 ${requestData.inviter.username} 邀请您加入群聊 ${requestData.group.name}。`
    ),
    duration: 5000, // 5秒后自动关闭
    position: 'top-right'
  })
}
</script>

<template>
  <div class="container">
    <NavigationSidebar :phoneNum="phoneNum" />
    <router-view></router-view>
    <ConversationView />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-home-details-box-bgc);
}
</style>
