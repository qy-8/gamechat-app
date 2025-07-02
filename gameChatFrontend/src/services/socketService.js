import { io } from 'socket.io-client'
import {
  useUserStore,
  useChatStore,
  useFriendStore,
  useGroupStore
} from '@/stores'
import emitter from './eventBus'

let socket = null

export const connectSocket = () => {
  const userStore = useUserStore()
  const chatStore = useChatStore()

  if (socket && socket.connected) {
    return socket
  }

  if (!userStore.token) {
    console.error('Socket.IO: 该用户无 token')
    return null
  }

  const VITE_SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

  socket = io(VITE_SOCKET_URL, {
    auth: {
      token: userStore.token
    }
  })

  socket.on('connect', () => {
    console.log('Socket 连接成功')
  })

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      socket.connect() // 尝试重连
    }
  })

  socket.on('connect_error', (err) => {
    console.error(`Socket: 连接错误， 原因：${err.message}`)
    if (err.message.includes('认证失败')) {
      userStore.logout()
      ElMessage.success('请重新登陆')
      router.push('/auth')
    }
  })

  socket.on('new_message', (newMessage) => {
    if (newMessage.mentions.length === 0) {
      chatStore.handleNewRealTimeMessage(newMessage)
    } else {
      if (newMessage.conversationId !== chatStore.activeConversation?._id) {
        emitter.emit('show-notification', {
          type: 'mention',
          title: `在 #${newMessage.groupInfo.name} 中被提及`,
          message: `${newMessage.sender.username}: ${newMessage.content}`
        })
      }
    }
  })

  // 新好友请求
  socket.on('new_friend_request', (requestData) => {
    const friendStore = useFriendStore()
    friendStore.handleNewRequest(requestData)
  })

  // 新群组邀请
  socket.on('new_group_invitation', (invitationData) => {
    const groupStore = useGroupStore()
    groupStore.handleNewRequest(invitationData)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => {
  // 返回当前模块中存储的 socket 实例
  return socket
}
