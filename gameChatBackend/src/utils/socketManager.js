// 存储当前用户所有的 socket.id
// key: userId, value: Set<socket.id>
const onlineUsers = new Map()
// key: socket.id, value: userId
const socketUserMap = new Map()

// 添加用户的 socket 连接记录
const addUserSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    // 创建空 Set 对象，储存当前用户所有 socket.id
    onlineUsers.set(userId, new Set())
  }
  onlineUsers.get(userId).add(socketId)
  // 记录 socket ID 到 userId 的映射，方便触发 disconnect 时查找
  socketUserMap.set(socketId, userId)

  console.log(`用户 ${userId} 的新 socket 连接 ${socketId} 已添加。`)
  console.log('目前在线用户:', Array.from(onlineUsers.keys()))
  console.log(`当前在线用户总数 : ${onlineUsers.size}`)
  console.log(`当前活动socket连接总数: ${socketUserMap.size}`)
}

// 移除用户的 socket 连接记录
const removeUserSocket = (socketId) => {
  // 找到断开连接的 disconnectedUserId
  const disconnectedUserId = socketUserMap.get(socketId)
  if (disconnectedUserId) {
    // 拿到当前用户的所有 socket ID
    const userSockets = onlineUsers.get(disconnectedUserId)
    if (userSockets) {
      userSockets.delete(socketId)
      if (userSockets.size === 0) {
        onlineUsers.delete(disconnectedUserId)
        console.log(`用户 ${disconnectedUserId} 已离线`)
      }
    }
    socketUserMap.delete(socketId)
    console.log(
      `用户 ${disconnectedUserId} 的 socket 连接 ${socketId} 已移除。`
    )
    console.log(`当前在线用户总数: ${onlineUsers.size}`)
    console.log(`当前活动socket连接总数: ${socketUserMap.size}`)
    return disconnectedUserId
  } else {
    return null
  }
}

// 获取当前用户的所有 socket ID
const getUserSockets = (userId) => {
  return onlineUsers.get(userId)
}

module.exports = {
  addUserSocket,
  removeUserSocket,
  getUserSockets
}
