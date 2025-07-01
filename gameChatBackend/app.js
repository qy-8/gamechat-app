const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./src/swagger')
require('dotenv').config()
const { connectDB } = require('./src/config/index')
const session = require('express-session')
const http = require('http')
// const socketIo = require('socket.io')
const { Server } = require('socket.io')
const setupSocket = require('./src/socket')
require('./src/utils/ossClient')
const multer = require('multer')

// 引入路由
const captchaRouter = require('./src/routes/captcha')
const userRouter = require('./src/routes/user')
const authRouter = require('./src/routes/auth')
const groupRouter = require('./src/routes/group')
const chatRouter = require('./src/routes/chat')
const friendRouter = require('./src/routes/friend')

const app = express()
const server = http.createServer(app)
app.use(
  cors({
    origin: 'http://localhost:5173', // 允许前端访问
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // 允许携带 cookie
  })
)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.set('io', io)

// 初始化 socket.io
setupSocket(io)

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// 连接数据库
connectDB()

app.use(express.json())
app.use(
  session({
    secret: 'my_super_secret_key_123',
    resave: false,
    saveUninitialized: true
  })
)

app.use('/api', captchaRouter)
app.use('/api/auth', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/groups', groupRouter)
app.use('/api/chat', chatRouter)
app.use('/api/friends', friendRouter)

// 健康检查
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})

// 最后一个中间件：统一错误处理
app.use((err, req, res, next) => {
  console.error('全局错误处理器捕获到错误', err)
  // 处理 Multer 相关错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // 限制大小2MB
      const maxSizeMB = (2 * 1024 * 1024) / (1024 * 1024)
      return res.status(413).json({
        status: 'error',
        message: `文件过大，请上传小于 ${maxSizeMB}MB 的图片。`
      })
    }
    return res.status(400).json({
      status: 'error',
      message: err.message || '文件上传处理过程中发生错误。'
    })
  }

  // 处理在 fileFilter 中通过 new Error 抛出的文件类型错误
  if (err.message === '只允许上传图片文件') {
    return res.status(400).json({
      status: 'error',
      message: '只允许上传图片文件，请选择有效的图片格式'
    })
  }

  // 统一返回 JSON 格式
  res.status(500).json({
    status: 'error',
    message: err.message || '服务端错误'
  })
})

// 启动服务器并监听指定端口
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`)
})
