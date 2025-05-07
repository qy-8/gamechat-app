const Group = require('../models/Group')
const User = require('../models/User')
const response = require('../utils/response')
const Channel = require('../models/Channel')

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

// 获取用户所属的群组所有用户
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId
    const groups = await Group.find({ members: userId }).populate(
      'members',
      'username avatar'
    )

    response.success(res, groups, '获取群组信息成功')
  } catch (err) {
    response.error(res, '获取群组信息失败', 400)
  }
}

// 邀请用户加入群组
const inviteUserToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body
    const currentUserId = req.user.userId

    // 查找群组并检查当前用户是否是管理员
    const group = await Group.findById(groupId)

    if (!group) {
      return response.error(res, '群组不存在', 400)
    }
    // _id 是 ObjectId
    if (group.createdBy.toString() !== currentUserId.toString()) {
      return response.error(res, '只有群主才能邀请用户', 400)
    }

    // 检查用户是否已在该群组中
    if (group.members.includes(userId)) {
      return response.error(res, '用户已在该群组中', 400)
    }

    // 将用户添加到群组
    group.members.push(userId)
    await group.save()

    // 返回成功响应
    response.success(res, {}, '邀请成功')
  } catch (err) {
    response.error(res, '邀请用户加入群组失败', 400)
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
  const file = req.file
  if (!file) {
    return response.error(res, '群组头像上传失败', 401)
  }

  const fileUrl = `/uploads/${file.filename}`
  response.success(res, { url: fileUrl }, '群组头像上传成功')
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

module.exports = {
  createGroup,
  getUserGroups,
  inviteUserToGroup,
  leaveGroup,
  uploadGroupAvatar,
  createChannel,
  deleteChannel,
  getChannels
}
