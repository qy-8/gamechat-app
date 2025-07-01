const response = require('../utils/response')
const User = require('../models/User')
const { hashPassword } = require('../utils/crypto')
const { verifySmsCode } = require('../services/smsService')

const resetPassword = async (req, res) => {
  try {
    const { newPwd } = req.body
    const userId = req.user.userId

    const storedSmsCode = await verifySmsCode(req, res)
    if (!storedSmsCode) {
      return response.error(res, '验证码不正确', 400)
    }
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 404)
    }

    const hashedPassword = await hashPassword(newPwd)
    user.password = hashedPassword
    await user.save()
    response.success(res, {}, '密码重置成功')
  } catch (err) {
    response.error(res, '密码重置失败')
  }
}

module.exports = {
  resetPassword
}
