const mongoose = require('mongoose') // 数据库
require('dotenv').config() // 引入环境变量配置

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1) // 退出进程
  }
}

module.exports = connectDB
