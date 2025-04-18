const bcrypt = require('bcrypt')
require('dotenv').config()

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10

// 加密密码
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    return hashedPassword
  } catch (error) {
    console.error('密码加密失败：', error)
    throw new Error('密码加密失败')
  }
}

module.exports = {
  hashPassword
}
