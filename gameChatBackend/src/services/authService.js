const jwt = require('jsonwebtoken')
require('dotenv').config()

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      user_pic: user.avatar,
      phoneNumber: user.phoneNumber,
      favoriteGames: user.favoriteGames
    },
    process.env.JWT_SECRET,
    { expiresIn: '144h' }
  )
}

// 验证JWT令牌是否过期或被改
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (err) {
    throw new Error('JWT令牌不合格或者已过期')
  }
}

module.exports = {
  generateToken,
  verifyToken
}
