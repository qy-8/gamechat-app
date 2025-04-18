const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./src/swagger')
require('dotenv').config()
const { connectDB } = require('./src/config/index')
const session = require('express-session')
const http = require('http')
const socketIo = require('socket.io')
const setupSocket = require('./src/socket')

// 引入路由
const captchaRouter = require('./src/routes/captcha')
const userRouter = require('./src/routes/user')
const resetPassword = require('./src/routes/auth')
const groupRoutes = require('./src/routes/group')

const app = express()
const server = http.createServer(app)
app.use(
  cors({
    origin: 'http://localhost:5173', // 允许前端访问
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // 允许携带 cookie
  })
)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

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
app.use('/api/auth', resetPassword)
app.use('/api/groups', groupRoutes)

// 健康检查
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})

// 最后一个中间件：统一错误处理
app.use((err, req, res, next) => {
  // 统一返回 JSON 格式
  res.status(400).json({
    status: 'error',
    message: err.message || '服务端错误'
  })
})

/**
 * 启动服务器并监听指定端口
 */
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  // ✅ 使用 server.listen
  console.log(`Server running at http://127.0.0.1:${PORT}`)
})
