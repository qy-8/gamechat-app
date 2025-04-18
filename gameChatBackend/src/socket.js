const onlineUsers = {} // 在线用户列表, socket.id 作为 key，用户数据作为 value
const messageCooldowns = {} // 每个用户的消息冷却时间

const setupSocket = (io) => {
  // io 为 socket.io 的服务器实例，监听 connection 事件，当用户连接到服务器时触发
  // socket 为当前连接用户，唯一且有 socket.id 标识
  io.on('connection', (socket) => {
    console.log(`用户连接: ${socket.id}`)

    // 将用户添加到在线用户列表
    onlineUsers[socket.id] = {
      socketId: socket.id,
      username: '' // 假设你通过登录或其他方式获取用户名
    }
    console.log(onlineUsers)

    // 处理用户加入房间
    socket.on('joinRoom', (room) => {
      socket.join(room)
      console.log(`用户 ${socket.id} 加入房间 ${room}`)
      io.to(room).emit('message', `${socket.id} 已加入房间`)
    })

    // 处理用户离开房间
    socket.on('leaveRoom', (room) => {
      socket.leave(room)
      console.log(`用户 ${socket.id} 离开房间 ${room}`)
      io.to(room).emit('message', `${socket.id} 已离开房间`)
    })

    // 限制消息发送频率，防止滥用
    socket.on('sendMessage', (data) => {
      const { room, message, isAnnouncement } = data

      // 如果是公告消息，广播到所有房间
      if (isAnnouncement) {
        io.emit('announcement', message) // 广播公告给所有人
        console.log(`广播公告: ${message}`)
        return
      }

      // 如果是房间消息，限制用户发送频率
      if (
        messageCooldowns[socket.id] &&
        Date.now() - messageCooldowns[socket.id] < 1000
      ) {
        // 如果冷却时间未过，拒绝处理
        socket.emit('message', '请稍等一会再发送消息')
        return
      }

      // 更新冷却时间
      messageCooldowns[socket.id] = Date.now()

      // 向房间发送消息
      io.to(room).emit('message', message)
      console.log(`房间 ${room} 中发送消息: ${message}`)
    })

    // 用户断开连接
    socket.on('disconnect', () => {
      console.log(`用户 ${socket.id} 断开连接`)
      delete onlineUsers[socket.id] // 从在线用户列表中删除
      delete messageCooldowns[socket.id] // 删除用户的冷却时间记录
    })
  })
}

module.exports = setupSocket
