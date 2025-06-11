import { io } from 'socket.io-client'
import { useUserStore } from '@/stores'
import { useChatStore } from '@/stores'

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

  socket.on('receive-message', (newMessage) => {
    console.log('Socket 收到新消息：', newMessage)
    chatStore.handleNewRealTimeMessage(newMessage)
  })

  // socket.on('new-friend-request', (requestData) => {
  //   console.log('Socket 收到新的好友请求：', requestData)
  //   console.log('正在发消息通知')
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
