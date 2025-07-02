const User = require('../models/User')
const response = require('../utils/response')
const path = require('path')
const fs = require('fs')
const ossClient = require('../utils/ossClient')

// 获取用户信息，包括 id，用户名，头像，手机号码等
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId
    // 查询用户信息，排除 password
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return response(res, '用户不存在', 404)
    }
    response.success(res, user, '获取用户信息成功')
  } catch (err) {
    response.error(res, '获取用户信息失败')
  }
}

// 更新用户信息，包括用户名，手机号码
const updateUserInfo = async (req, res) => {
  const { username, phoneNumber } = req.body

  const userId = req.user.userId

  try {
    const user = await User.findById(userId)
    if (!user) {
      return response.error(res, '用户不存在', 400)
    }
    // 更新用户信息，当新值不为空时更新
    user.username = username || user.username
    user.phoneNumber = phoneNumber || user.phoneNumber

    await user.save()
    response.success(res, {}, '用户信息更新成功')
  } catch (err) {
    response.error(res, '更新用户信息失败')
  }
}

const uploadAvatar = async (req, res) => {
  const userId = req.user.userId
  const file = req.file
  console.log('这里是file', file)

  if (!userId) {
    if (file && file.path) {
      // 无 userId 的情况下删除临时文件
      fs.unlink(file.path, (err) => {
        if (err) console.error('清理未提供userId的临时文件失败:', err)
      })
    }
    return response.error(res, '未提供userId', 400)
  }

  console.log(file)
  if (!file) {
    console.log(file)
    return response.error(res, '个人头像上传失败', 400)
  }

  // 生成文件名
  const fileExtension = path.extname(file.originalname)
  const uniqueId = `${Date.now()}_${Math.random().toString(16).slice(2)}`
  const ossFileName = `user-avatars/${userId}/${uniqueId}${fileExtension}`
  let ossFileUrl = null
  try {
    // 上传文件到阿里云 OSS
    console.log(`准备上传文件: ${file.path} 到 OSS 对象: ${ossFileName}`)
    const result = await ossClient.put(ossFileName, file.path, {
      headers: {
        'x-oss-object-acl': 'public-read' // 设置对象的 ACL 为公共读
      }
    })
    // 获取 OSS 返回的图片 URL
    ossFileUrl = result.url
    console.log('文件上传成功，OSS URL:', ossFileUrl)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: ossFileUrl }, // 确保你的 Group 模型有 avatarUrl 字段
      { new: true } // 返回更新之后的数据
    )

    if (!updatedUser) {
      console.error(
        `群组ID: ${userId} 未找到，OSS上的文件 ${ossFileUrl} 可能成为孤儿文件。`
      )
      // 删除OSS上的孤儿文件
      try {
        // 尝试删除已上传到 OSS 的文件，因为数据库未找到对应用户
        await ossClient.delete(ossFileName)
        console.log(`OSS上的孤儿文件 ${ossFileName} 删除成功。`)
      } catch (ossDeleteError) {
        // 删除OSS文件失败，返回群组未找到的错误
        console.error(
          `尝试删除OSS上的孤儿文件 ${ossFileName} 失败:`,
          ossDeleteError
        )
      }
      // 对应群组不存在情况下删除本地文件
      fs.unlink(file.path, (err) => {
        if (err) console.error('用户未找到时清理本地临时文件失败:', err)
      })
      return response.error(res, '用户不存在，头像信息未更新', 404)
    }
    // 成功情况下删除本地服务器上的临时文件
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('删除本地临时文件失败:', err, '路径:', file.path)
      } else {
        console.log('本地临时文件删除成功:', file.path)
      }
    })
    response.success(res, { avatarUrl: ossFileUrl }, '个人头像更新成功')
  } catch (error) {
    console.error('上传头像到OSS或更新数据库失败:', error)

    // 如果文件已上传到 OSS (ossFileUrl 有值)，但后续步骤失败，删除 OSS 文件
    if (ossFileUrl && ossFileName) {
      console.error(`主流程发生错误，OSS上的文件 ${ossFileUrl} 将尝试删除。`)
      try {
        await ossClient.delete(ossFileName)
        console.log(`主流程错误后，OSS上的文件 ${ossFileName} 删除成功。`)
      } catch (ossDeleteError) {
        console.error(
          `主流程错误后，尝试删除OSS上的文件 ${ossFileName} 失败:`,
          ossDeleteError
        )
      }
    }

    // 抛出异常情况下删除本地临时文件
    fs.unlink(file.path, (err) => {
      if (err) console.error('错误发生时清理本地临时文件失败:', err)
    })
    response.error(
      res,
      `服务器内部错误: ${error.message || '上传个人头像失败'}`,
      500
    )
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
    response.error(res, '删除账号失败')
  }
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  deleteUser,
  uploadAvatar
}
