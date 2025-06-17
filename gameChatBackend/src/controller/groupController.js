const Group = require('../models/Group')
const User = require('../models/User')
const response = require('../utils/response')
const Channel = require('../models/Channel')
const ossClient = require('../utils/ossClient')
const path = require('path')
const fs = require('fs')
const { getUserSockets } = require('../utils/socketManager')

// 创建群组
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.userId // 从 token 中获取用户信息
    // 创建新的群组
    const group = new Group({
      name,
      createdBy: userId,
      members: [userId], // 创建者自己加入群组
      description
    })
    await group.save()
    // 把群组 ID 添加到用户的 groups 列表中
    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: group._id } // 避免重复
    })
    // 返回创建成功的群组信息
    response.success(res, group, '群组创建成功')
  } catch (err) {
    console.error('创建群组失败', err)
    response.error(res, '创建群组失败', 400)
  }
}

// 获取用户所属的群组
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId
    // const groups = await Group.find({ members: userId }).populate(
    //   'members',
    //   'username avatar'
    // )
    const groups = await Group.find({ members: userId }).select(
      'name avatar description type'
    )
    response.success(res, groups, '获取群组信息成功')
  } catch (err) {
    response.error(res, '获取群组信息失败', 400)
  }
}

// 邀请用户加入群组
const sendGroupInvitation = async (req, res) => {
  try {
    const { groupId } = req.params
    const { inviteeIds } = req.body
    const inviterId = req.user.userId

    if (!Array.isArray(inviteeIds) || inviteeIds.length === 0) {
      return response.error(res, '请提供要邀请的用户ID', 400)
    }

    // 查找群组并检查当前用户是否是管理员
    const group = await Group.findById(groupId)

    if (!group) {
      return response.error(res, '群组不存在', 400)
    }
    // _id 是 ObjectId
    if (group.createdBy.toString() !== inviterId.toString()) {
      return response.error(res, '只有群主才能邀请用户', 400)
    }

    for (const inviteeId of inviteeIds) {
      if (inviteeId.toString() === inviterId.toString()) {
        return response.error(res, '不能邀请自己加入群组', 400)
      }

      // 检查用户是否已在该群组中
      if (group.members.some((member) => member.equals(inviteeId))) {
        return response.error(res, '用户已在该群组中', 400)
      }
      // 检查是否有待处理邀请
      const existingInvitation = group.pendingInvitations.find(
        (inv) => inv.invitee.toString() === inviteeId
      )

      if (existingInvitation) {
        return response.error(res, '已发送过邀请，请等待用户处理', 409)
      }
    }

    for (const inviteeId of inviteeIds) {
      group.pendingInvitations.push({
        inviter: inviterId,
        invitee: inviteeId
      })
    }

    await group.save()

    const io = req.app.get('io')

    const inviterInfo = await User.findById(inviterId)
      .select('username avatar')
      .lean()
    const groupInfo = { _id: group._id, name: group.name, avatar: group.avatar }

    for (const inviteeId of inviteeIds) {
      const recipientSockets = getUserSockets(inviteeId.toString())
      if (recipientSockets && recipientSockets.size > 0) {
        const invitationPayload = {
          group: groupInfo,
          inviter: inviterInfo
        }
        // 向该用户的所有打开的客户端发送事件
        recipientSockets.forEach((socketId) => {
          io.to(socketId).emit('new_group_invitation', invitationPayload)
        })
      }
    }
    // 返回成功响应
    response.success(res, {}, '邀请成功')
  } catch (err) {
    console.error('批量发送群组邀请失败:', err)
    response.error(res, '发送群组邀请失败', 500)
  }
}

// 退出群组
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body
    const userId = req.user.userId // 当前用户

    // 查找群组
    const group = await Group.findById(groupId)

    // 确保群组存在并且用户是群组成员
    if (!group || !group.members.includes(userId)) {
      return response.error(res, '您不在该群组中', 400)
    }

    // 移除用户
    group.members = group.members.filter(
      (member) => member.toString() !== userId.toString()
    )
    await group.save()

    // 返回成功响应
    response.success(res, {}, '您已退出该群组')
  } catch (err) {
    response.error(res, '退出群组失败', 400)
  }
}

const uploadGroupAvatar = async (req, res) => {
  const { groupId } = req.params
  const file = req.file
  console.log('这里是file', file)

  if (!groupId) {
    if (file && file.path) {
      // 无 groupId 的情况下删除临时文件
      fs.unlink(file.path, (err) => {
        if (err) console.error('清理未提供groupId的临时文件失败:', err)
      })
    }
    return response.error(res, '未提供群组ID', 400)
  }

  console.log(file)
  if (!file) {
    console.log(file)
    return response.error(res, '群组头像上传失败', 400)
  }

  // 生成文件名
  const fileExtension = path.extname(file.originalname)
  const uniqueId = `${Date.now()}_${Math.random().toString(16).slice(2)}`
  const ossFileName = `group-avatars/${groupId}/${uniqueId}${fileExtension}`
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
    // const ossFileUrl = result.url - 更改前

    console.log('文件上传成功，OSS URL:', ossFileUrl)

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { avatar: ossFileUrl }, // 确保你的 Group 模型有 avatarUrl 字段
      { new: true } // 返回更新之后的数据
    )

    if (!updatedGroup) {
      console.error(
        `群组ID: ${groupId} 未找到，OSS上的文件 ${ossFileUrl} 可能成为孤儿文件。`
      )
      // 删除OSS上的孤儿文件
      try {
        // ***************************************************************
        // ** 尝试删除已上传到 OSS 的文件，因为数据库未找到对应群组 **
        // ***************************************************************
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
        if (err) console.error('群组未找到时清理本地临时文件失败:', err)
      })
      return response.error(res, '群组不存在，头像信息未更新', 404)
    }
    // 成功情况下删除本地服务器上的临时文件
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('删除本地临时文件失败:', err, '路径:', file.path)
      } else {
        console.log('本地临时文件删除成功:', file.path)
      }
    })
    response.success(res, { avatarUrl: ossFileUrl }, '群组头像上传成功')
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
      `服务器内部错误: ${error.message || '上传头像失败'}`,
      500
    )
  }
}

const createChannel = async (req, res) => {
  try {
    const { name, groupId } = req.body
    const userId = req.user.userId

    const newChannel = new Channel({
      name,
      groupId,
      createdBy: userId
    })

    await newChannel.save()

    response.success(res, newChannel, '频道创建成功')
  } catch (error) {
    console.error(error)
    response.error(res, '创建频道失败')
  }
}

const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params

    const channel = await Channel.findById(channelId)

    if (!channel) {
      return response.error(res, '频道不存在', 404)
    }

    await Channel.findByIdAndDelete(channelId)

    response.success(res, null, '频道删除成功')
  } catch (error) {
    console.error(error)
    response.error(res, '删除频道失败')
  }
}

const getChannels = async (req, res) => {
  const { groupId } = req.params

  try {
    const channels = await Channel.find({ groupId })
    response.success(res, channels, '获取频道成功')
  } catch (error) {
    response.error(res, '获取频道失败')
  }
}

const responseToGroupInvitation = async (req, res) => {
  try {
    const { groupId } = req.params
    const { action } = req.body
    const inviteeId = req.user.userId

    if (!['accept', 'decline'].includes(action)) {
      return response.error(res, '无效操作', 400)
    }

    const group = await Group.findById(groupId)
    if (!group) {
      return response.error(res, '群组不存在', 404)
    }

    const invitation = group.pendingInvitations.find((inv) =>
      inv.invitee.equals(inviteeId)
    )

    if (!invitation) {
      return response.error(res, '邀请已失效', 404)
    }

    if (action === 'accept') {
      if (!group.members.some((m) => m.equals(inviteeId))) {
        group.members.push(inviteeId)
      }
      group.pendingInvitations.pull(invitation._id)

      await group.save()
      return response.success(res, group, '已成功加入群组')
    } else {
      group.pendingInvitations.pull(invitation._id)
      await group.save()
      return response.success(res, null, '已拒绝群组邀请')
    }
  } catch (error) {
    console.error(error)
    response.error(res, '操作失败')
  }
}

// 获取群组的成员列表
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.userId

    const group = await Group.findById(groupId).populate(
      'members',
      'username avatar'
    )

    if (!group) {
      return response.error(res, '群组不存在', 404)
    }

    // 检查当前用户是否是该群组成员
    const isMember = group.members.some((member) => member._id.equals(userId))
    if (!isMember) {
      return response.error(res, '你不是该群组成员，无权查看', 403)
    }

    response.success(res, group, '获取群组详情成功')
  } catch (err) {
    console.error('获取群组详情失败:', err)
    response.error(res, '获取群组详情失败', 500)
  }
}

const searchGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params
    const { q: searchTerm, page = 1, limit = 5 } = req.query
    const currentUserId = req.user.userId

    if (!searchTerm) {
      return response.success(
        res,
        {
          members: [],
          currentPage: 1,
          totalPages: 0,
          totalMembers: 0
        },
        '请输入搜索关键词'
      )
    }

    const group = await Group.findById(groupId).select('members')

    if (!group) {
      response.error(res, '群组不存在', 400)
    }

    const isMember = group.members.some((memberId) =>
      memberId.equals(currentUserId)
    )

    if (!isMember) {
      response.error(res, '您不是群组成员，无权限搜索群组成员', 403)
    }

    const searchRegex = new RegExp(searchTerm, 'i')
    // 搜索条件：
    // 1. _id 在群组的 members 中
    // 2. username 必须匹配搜索词
    const queryConditions = {
      _id: { $in: group.members },
      username: { $regex: searchRegex }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [foundMembers, totalMembers] = await Promise.all([
      User.find(queryConditions)
        .select('username avatar _id')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(queryConditions)
    ])
    const totalPages = Math.ceil(totalMembers / parseInt(limit))

    const responseData = {
      members: foundMembers,
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalMembers: totalMembers
    }
    response.success(res, responseData, '成员搜索成功')
  } catch (error) {
    console.error(error)
    response.error(res, '搜索失败，服务器内部错误', 500)
  }
}

const getPendingGroupInvitations = async (req, res) => {
  try {
    const currentUserId = req.user.userId

    const groupsWithMyInvites = await Group.find({
      'pendingInvitations.invitee': currentUserId
    })
      .select('name avatar createdBy pendingInvitations')
      .populate('pendingInvitations.inviter', 'username avatar')

    const myInvitations = groupsWithMyInvites.flatMap((group) =>
      group.pendingInvitations
        .filter((invitation) => invitation.invitee.equals(currentUserId))
        .map((invitation) => ({
          _id: invitation._id,
          group: {
            _id: group._id,
            name: group.name,
            avatar: group.avatar
          },
          inviter: invitation.inviter,
          createdAt: invitation.createdAt
        }))
    )
    myInvitations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    response.success(res, myInvitations, '获取待处理的群组邀请成功')
  } catch (err) {
    console.error('获取群组邀请失败:', err)
    response.error(res, '获取邀请失败，服务器内部错误')
  }
}

const kickGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params
    const currentUserId = req.user.userId

    const group = await Group.findById(groupId)
    if (!group) {
      return response.error(res, '未找到对应群组', 404)
    }
    if (group.createdBy.toString() !== currentUserId) {
      return response.error(res, '您没有权限执行此操作', 403)
    }
    if (memberId === currentUserId) {
      return response.error(res, '群主不能将自己移出群组', 400)
    }
    const isMember = group.members.some((id) => id.equals(memberId))
    if (!isMember) {
      return response.error(res, '该用户不是群组成员', 404)
    }

    await Group.updateOne({ _id: groupId }, { $pull: { members: memberId } })

    await User.updateOne({ _id: memberId }, { $pull: { groups: groupId } })

    return response.success(res, null, '移除成功')
  } catch (error) {
    console.error(error)
    return response.error(res, '踢出群组成员失败')
  }
}

module.exports = {
  createGroup,
  getUserGroups,
  sendGroupInvitation,
  leaveGroup,
  uploadGroupAvatar,
  createChannel,
  deleteChannel,
  getChannels,
  responseToGroupInvitation,
  getGroupDetails,
  searchGroupMembers,
  getPendingGroupInvitations,
  kickGroupMember
}
