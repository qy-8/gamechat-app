const response = require('../utils/response')
const User = require('../models/User')
const { hashPassword } = require('../utils/crypto')
const { verifySmsCode } = require('../services/smsService')

const resetPassword = async (req, res) => {
  const { newPwd } = req.body
  // console.log('这个是新的密码', newPwd)
  const userId = req.user.userId
  try {
    const storedSmsCode = await verifySmsCode(req, res)
    if (!storedSmsCode) {
      return response.error(res, '验证码不正确', 400)
    }
  } catch (error) {
    console.error(error)
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 400)
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
