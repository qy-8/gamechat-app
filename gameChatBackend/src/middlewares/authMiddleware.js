const jwt = require('jsonwebtoken')
const response = require('../utils/response')
require('dotenv').config() // 引入环境变量配置

const authMiddleware = (req, res, next) => {
  // 获取 Bearer 后跟的 token
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return response.error(res, '未提供令牌', 401)
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // 将解码后的信息存储到req.user
    // console.log(decoded)
    next() // 验证成功
  } catch (err) {
    return response.error(res, '令牌不正确或登陆已过期', 401)
  }
}

module.exports = authMiddleware
