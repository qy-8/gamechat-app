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
    console.log('Socket.IO: 已连接')
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
    console.log(`Socket 连接已断开， 原因：${reason}`)

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
    console.log('Socket 收到新消息：', newMessage)
    if (newMessage.mentions.length === 0) {
      console.log(3333, newMessage)
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

  // socket.on('new-friend-request', (requestData) => {
  //   console.log('Socket 收到新的好友请求：', requestData)
  //   console.log('正在发消息通知')
  // })

  // 新好友请求
  socket.on('new_friend_request', (requestData) => {
    console.log('[Socket Service] 收到 new_friend_request:', requestData)
    const friendStore = useFriendStore()
    friendStore.handleNewRequest(requestData)
  })

  // 新群组邀请
  socket.on('new_group_invitation', (invitationData) => {
    console.log('[Socket Service] 收到 new_group_invitation:', invitationData)
    const groupStore = useGroupStore()
    groupStore.handleNewRequest(invitationData)
  })

  // socket.on('you_were_mentioned', (notificationData) => {
  //   console.log(notificationData)
  //   if (
  //     notificationData.message.conversationId !==
  //     chatStore.activeConversation?._id
  //   ) {
  //     emitter.emit('show-notification', {
  //       type: 'mention',
  //       title: `在 #${notificationData.group.name} 中被提及`,
  //       message: `${notificationData.mentionedBy.username}: ${notificationData.message.content}`
  //     })
  //   }
  // })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('Socket 已断开连接')
  }
}

export const getSocket = () => {
  // 这个函数只是简单地返回当前模块中存储的 socket 实例
  return socket
}
