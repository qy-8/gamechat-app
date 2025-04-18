const User = require('../models/User')
const response = require('../utils/response')

// 获取用户信息，包括 id，用户名，头像，手机号码等
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId
    // 查询用户信息，排除 password
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return response(res, '用户不存在', 400)
    }
    response.success(res, user, '获取用户信息成功')
  } catch (err) {
    response.error(err, err.message)
  }
}

// 更新用户信息，包括用户名，头像，手机号码
const updateUserInfo = async (req, res) => {
  const { username, avatar, phoneNumber } = req.body

  const userId = req.user.userId

  try {
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 400)
    }
    // 更新用户信息，当新值不为空时更新
    user.username = username || user.username
    user.avatar = avatar || user.avatar
    user.phoneNumber = phoneNumber || user.phoneNumber

    await user.save()
    response.success(res, {}, '用户信息更新成功')
  } catch (err) {
    response.error(res, err.message)
  }
}

// 用户删除账号，将数据库的 status 改为 0
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 400)
    }

    // 设置用户状态为 0，表示删除
    user.status = 0
    await user.save()

    response.success(res, {}, '用户已删除（状态设置为 0）')
  } catch (err) {
    response.error(res, err.message)
  }
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  deleteUser
}
