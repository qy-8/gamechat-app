const Friendship = require('../models/Friendship')
const User = require('../models/User')
const response = require('../utils/response')
const { getUserSockets } = require('../utils/socketManager')

const getFriendList = async (req, res) => {
  const userId = req.user.userId

  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'friends',
      deletedAt: null
    })
      .populate('requester', 'username avatar _id')
      .populate('recipient', 'username avatar _id')

    // 查看 requester 和 recipient 中的哪个是自己来返回另一个用户给前端
    const friendsList = friendships.map((friendship) => {
      if (friendship.requester._id.toString() === userId) {
        return friendship.recipient // 如果当前用户是请求者，好友就是接收者
      } else {
        return friendship.requester // 如果当前用户是接收者，好友就是请求者
      }
    })
    return response.success(res, friendsList, '获取好友列表成功')
  } catch (error) {
    console.error(error)
    return response.error(res, '获取好友列表失败')
  }
}

const deleteFriend = async (req, res) => {
  const userId = req.user.userId
  const targetUserId = req.params.friendId

  if (!targetUserId) {
    return response.error(res, '未提供要删除的用户Id', 400)
  }
  if (userId.toString() === targetUserId.toString()) {
    return response.error(res, '不能删除自己', 400)
  }
  try {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: targetUserId },
        { requester: targetUserId, recipient: userId }
      ],
      status: 'friends',
      deletedAt: null
    })

    if (!friendship) {
      return response.error(res, '删除失败，你与该用户不是好友关系', 404)
    }
    friendship.status = 'unfriended'
    friendship.deletedAt = Date.now()

    await friendship.save()
    return response.success(res, '好友删除成功')
  } catch (error) {
    console.error(error)
    return response.error(res, '删除好友失败')
  }
}

const updateFriendshipStatus = async (req, res) => {
  const currentUserId = req.user.userId
  const targetUserId = req.params.friendId
  const { status } = req.body

  if (!targetUserId) {
    return response.error(res, '未提供目标用户Id', 400)
  }
  if (currentUserId.toString() === targetUserId.toString()) {
    return response.error(res, '不能拉黑/恢复自己', 400)
  }
  if (!status || !['friends', 'blocked'].includes(status)) {
    return response.error(res, '未提供 status', 400)
  }
  try {
    let friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId }
      ]
    })

    // 拉黑陌生人时创建：
    if (!friendship && status === 'blocked') {
      friendship = new Friendship({
        requester: currentUserId,
        recipient: targetUserId,
        status: 'blocked',
        blockedBy: currentUserId
      })
      await friendship.save()
      return response.success(res, friendship, '已将该用户拉黑')
    } else if (!friendship) {
      return response.error(res, '此用户不在黑名单内', 404)
    }

    if (status === 'blocked') {
      friendship.status = status
      friendship.blockedBy = currentUserId
      friendship.deletedAt = null
      await friendship.save()
      return response.success(res, friendship, '已将该用户拉黑')
    } else if (status === 'friends') {
      if (
        friendship.status === 'blocked' &&
        friendship.blockedBy &&
        friendship.blockedBy.toString() === currentUserId
      ) {
        if (friendship.acceptedAt) {
          friendship.status = 'friends'
        } else {
          friendship.status = 'unfriends'
        }
        friendship.blockedBy = null
        // 拉回黑名单后自动建立好友关系
        friendship.deletedAt = null
        await friendship.save()
        return response.success(res, friendship, '已经将该用户拉出黑名单')
      } else if (friendship.status === 'blocked') {
        return response.error(res, '你没有拉黑对方', 403)
      } else {
        return response.error(res, '该用户并未被你拉黑', 403)
      }
    }
  } catch (error) {
    console.error(error)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return response.error(res, '无效的用户ID', 400)
    }
    return response.error(res, '拉黑/恢复好友关系失败')
  }
}

const searchFriend = async (req, res) => {
  const currentUserId = req.user.userId
  const { q: searchTerm } = req.query
  if (
    !searchTerm ||
    typeof searchTerm != 'string' ||
    searchTerm.trim() === ''
  ) {
    return response.error(res, '请提供有效的关键词', 400)
  }

  try {
    const searchTermTrimmed = searchTerm.trim()
    const searchTermSanitized = searchTermTrimmed.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    )
    const searchRegexExact = new RegExp(`^${searchTermSanitized}$`, 'i')
    const users = await User.find({
      username: searchRegexExact,
      _id: { $ne: currentUserId } // 搜索结果不包括自己
    })
      .select('username avatar _id')
      .limit(1)
    return response.success(res, users)
  } catch (error) {
    console.error(error)
    return response.error(res, '搜索失败')
  }
}

const sendFriendRequest = async (req, res) => {
  const senderId = req.user.userId
  const { receiverId } = req.body

  // console.log(senderId, receiverId)
  if (!receiverId || receiverId === senderId) {
    return response.error(res, '发送好友请求失败', 400)
  }

  try {
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return response.error(res, '该用户不存在', 404)
    }
    const relationship = await Friendship.findOne({
      $or: [
        { requester: senderId, recipient: receiverId },
        { requester: receiverId, recipient: senderId }
      ]
    })

    let savedRequest
    if (relationship) {
      if (relationship.status === 'friends') {
        return response.error(res, '你们已经是好友了', 409)
      } else if (relationship.status === 'pending') {
        return response.error(res, '已存在待处理的好友请求', 409)
      } else if (relationship.status === 'blocked') {
        return response.error(res, '您不能申请为此人好友', 409)
      } else if (
        relationship.status === 'unfriended' ||
        relationship.status === 'declined'
      ) {
        relationship.status = 'pending'
        relationship.requestedAt = Date.now()
        relationship.acceptedAt = null
        relationship.deletedAt = null
        savedRequest = await relationship.save()
      } else {
        return response.error(res, '无法处理当前关系状态', 400)
      }
    } else {
      const newFriendRequest = new Friendship({
        requester: senderId,
        recipient: receiverId,
        status: 'pending'
      })
      savedRequest = await newFriendRequest.save()
    }

    if (!savedRequest) {
      return response.error(res, '未能创建好友请求', 500)
    }

    const populatedRequest = await Friendship.findById(savedRequest._id)
      .populate('requester', 'username avatar _id')
      .lean()

    if (!populatedRequest) {
      return response.error(res, '创建请求成功但无法获取详情', 500)
    }
    if (populatedRequest.status === 'pending') {
      const io = req.app.get('io')

      // 获取接收者的所有socket
      const recipientSockets = getUserSockets(receiverId)
      if (recipientSockets && recipientSockets.size > 0) {
        recipientSockets.forEach((socketId) => {
          io.to(socketId).emit('new_friend_request', populatedRequest)
        })
        return response.success(res, populatedRequest, '申请成功')
      }
    }
    return response.success(res, populatedRequest, '申请成功')
  } catch (error) {
    console.error(error)
    return response.error(res, '发送好友请求失败', 500)
  }
}

const handleFriendRequest = async (req, res) => {
  const userId = req.user.userId
  const { requestId } = req.params
  const { action } = req.body
  if (!action || !['accept', 'decline'].includes(action) || !requestId) {
    return response.error(res, '操作无效', 400)
  }
  try {
    const friendshipRequest = await Friendship.findById(requestId)

    if (!friendshipRequest) {
      return response.error(res, '好友请求不存在', 404)
    }

    if (friendshipRequest.recipient.toString() !== userId) {
      return response.error(res, '该用户无权限处理此请求', 403)
    }
    if (friendshipRequest.status !== 'pending') {
      return response.error(res, '此请求被处理过', 409)
    }
    if (action === 'accept') {
      friendshipRequest.status = 'friends'
      friendshipRequest.acceptedAt = Date.now()
      const newFriend = await User.findById(friendshipRequest.requester)
      await friendshipRequest.save()
      return response.success(res, newFriend, '操作成功')
    } else {
      friendshipRequest.status = 'declined'
      await friendshipRequest.save()
      return response.success(res, friendshipRequest, '操作成功')
    }
  } catch (error) {
    console.error(error)
    return response.error(res, '操作失败')
  }
}

const getIncomingRequest = async (req, res) => {
  const userId = req.user.userId

  try {
    const incomingRequests = await Friendship.find({
      recipient: userId,
      status: 'pending'
    })
      .populate('requester', 'username avatar _id')
      .sort({ requestedAt: -1 })

    return response.success(res, incomingRequests)
  } catch (error) {
    console.error(error)
    return response.error(res, '获取好友请求失败')
  }
}

const getBlockedList = async (req, res) => {
  const currentUserId = req.user.userId

  try {
    const blockedRelationships = await Friendship.find({
      blockedBy: currentUserId,
      status: 'blocked'
    })
      .populate('requester', 'username avatar _id')
      .populate('recipient', 'username avatar _id')

    const blackList = blockedRelationships.map((relationship) => {
      // 确保 relationship 和其内部的 requester/recipient 都存在，populate 可能失败
      if (relationship && relationship.requester && relationship.recipient) {
        if (
          relationship.requester._id.toString() === currentUserId.toString()
        ) {
          return relationship.recipient
        } else if (
          relationship.recipient._id.toString() === currentUserId.toString()
        ) {
          return relationship.requester
        }
      }
    })

    return response.success(res, blackList)
  } catch (error) {
    console.error(error)
    return response.error(res, '获取黑名单列表失败')
  }
}

module.exports = {
  sendFriendRequest,
  getIncomingRequest,
  handleFriendRequest,
  getFriendList,
  deleteFriend,
  updateFriendshipStatus,
  searchFriend,
  getBlockedList
}
