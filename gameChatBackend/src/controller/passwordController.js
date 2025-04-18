const response = require('../utils/response')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const { hashPassword } = require('../utils/crypto')

const resetPassword = async (req, res) => {
  const { oldPwd, newPwd } = req.body
  const userId = req.user.userId
  try {
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 400)
    }

    const isMatch = await bcrypt.compare(oldPwd, user.password)
    if (!isMatch) {
      return response.error(res, '旧密码不正确', 400)
    }
    const hashedPassword = await hashPassword(newPwd)
    user.password = hashedPassword
    await user.save()
    response.success(res, {}, '密码重置成功')
  } catch (err) {
    response.error(res, err.message)
  }
}

module.exports = {
  resetPassword
}
