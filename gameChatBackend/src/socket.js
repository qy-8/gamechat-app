const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { addUserSocket, removeUserSocket } = require('./utils/socketManager')

function setupSocket(io) {
  // 中间件验证 token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.userId

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          console.error('Socket 验证：token 中的 userId 无效')
          return next(new Error('验证失败，token 无效'))
        }
        socket.userId = userId.toString()
        next()
      } catch (error) {
        console.error('Socket 验证 token 时出现问题', error)
        next(new Error('验证失败，token 无效'))
      }
    } else {
      console.log('需要 token 认证 Socket')
      next(new Error('缺少 token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.userId

    if (!userId) {
      console.error('Socket 已连接，未提供 userId，正在断开连接')
      socket.disconnect(true)
      return
    }
    console.log('Socket 已连接')

    // 添加用户的 socket 连接记录
    addUserSocket(userId, socket.id)

    socket.on('ping_server', (data, callback) => {
      if (typeof callback === 'function') {
        callback('pong from server')
      }
    })

    socket.on('join_channel', (channelId) => {
      if (!channelId) {
        return
      }
      console.log(`Socket ${socket.id} 正在尝试加入频道 ${channelId}`)

      socket.join(channelId)
    })

    socket.on('disconnect', (reason) => {
      console.log(
        `用户 ${userId}，Socket ID ${socket.id} 因 ${reason} 断开连接`
      )
      // 移除用户的 socket 连接记录
      removeUserSocket(socket.id)
    })
  })
}

module.exports = setupSocket
