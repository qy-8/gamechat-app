const Conversation = require('../models/Conversation')
const mongoose = require('mongoose')
const response = require('../utils/response')
const Message = require('../models/Message')
const { getUserSockets } = require('../utils/socketManager')

// 获取或创建会话（当用户与另一个用户开启对话）
const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const { targetUserId } = req.body

    if (!targetUserId) {
      return response.error(res, '请提供 targetUserId', 400)
    }
    if (targetUserId === currentUserId) {
      return response.error(res, '不能和自己创建会话', 400)
    }

    let currentUserIdObjectId = null
    let targetUserIdObjectId = null

    // 将用户和目标用户 id 转换为 objectId
    try {
      currentUserIdObjectId = new mongoose.Types.ObjectId(currentUserId)
      targetUserIdObjectId = new mongoose.Types.ObjectId(targetUserId)
    } catch (error) {
      return response.error(res, '用户 id 或目标用户 id 无效', 400)
    }

    let participantsArray = [currentUserIdObjectId, targetUserIdObjectId]

    if (participantsArray[0].toString() > participantsArray[1].toString()) {
      // 解构赋值交换
      ;[participantsArray[0], participantsArray[1]] = [
        participantsArray[1],
        participantsArray[0]
      ]
    }

    let conversation = await Conversation.findOne({
      participants: { $all: participantsArray, $size: 2 },
      type: 'private'
    }).populate('participants', 'username avatar')

    let wasCreated = false

    // 如果会话不存在就创建新会话
    if (!conversation) {
      conversation = new Conversation({
        participants: participantsArray,
        lastMessageAt: Date.now(),
        type: 'private'
      })
      await conversation.save()
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'username avatar'
      )
      wasCreated = true
    }
    const successMessage = wasCreated ? '会话创建成功' : '会话获取成功'

    const conversationObject = conversation.toObject()

    conversationObject.targetParticipant = conversationObject.participants.find(
      (p) => p._id.toString() !== currentUserId
    )
    response.success(res, conversationObject, successMessage)
  } catch (error) {
    console.error('会话获取或创建失败', error)
    response.error(res, '服务器内部错误，无法获取或创建会话', 500)
  }
}

// 获取当前用户的会话列表
const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate({
        path: 'participants',
        select: 'username avatar'
      }) // 这一步 conversations 是包含了两个参与者的数组
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt messageType readAt',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      })
      .sort({ lastMessageAt: -1 }) // 按照发送消息时间倒序排列（最新会话在前）

    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const targetParticipant = conv.participants.find(
          (p) => p && p._id && p._id.toString() !== currentUserId
        )
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: currentUserId, // 消息的接收者是当前用户
          sender: { $ne: currentUserId },
          readAt: null
        })

        return {
          _id: conv._id,
          targetParticipant: targetParticipant
            ? {
                _id: targetParticipant._id,
                username: targetParticipant.username,
                avatar: targetParticipant.avatar
              }
            : null,
          lastMessage: conv.lastMessage
            ? {
                _id: conv.lastMessage._id,
                content: conv.lastMessage.content,
                sender: conv.lastMessage.sender,
                createdAt: conv.lastMessage.createdAt,
                messageType: conv.lastMessage.messageType,
                isReadByCurrentUser:
                  conv.lastMessage.sender._id.toString() === currentUserId
                    ? true
                    : conv.lastMessage.readAt
                      ? true
                      : false
              }
            : null,
          lastMessageContentSnippet: conv.lastMessageContentSnippet,
          lastMessageAt: conv.lastMessageAt,
          updatedAt: conv.updatedAt,
          unreadCount
        }
      })
    )
    response.success(res, processedConversations, '获取会话列表成功')
  } catch (error) {
    console.error('获取会话列表失败', error)
    response.error(res, '获取会话列表失败')
  }
}

// 在指定会话中发送消息
const sendMessage = async (req, res) => {
  try {
    const senderObjectId = req.currentUserObjectId
    const conversationObject = req.conversation
    const { content, messageType } = req.body

    if (!content || content.trim() === '') {
      return response.error(res, '消息内容不能为空', 400)
    }

    // 拿到接收者 id
    const receiverObjectId = conversationObject.participants.find(
      (participantId) => !participantId.equals(senderObjectId)
    )
    if (!receiverObjectId) {
      return response.error(res, '无消息接收者，会话异常')
    }

    // 保存新消息
    const newMessage = new Message({
      conversationId: conversationObject._id,
      sender: senderObjectId,
      receiver: receiverObjectId,
      content,
      messageType
    })
    await newMessage.save()

    // 更新会话的最新消息
    conversationObject.lastMessage = newMessage._id
    conversationObject.lastMessageContentSnippet =
      content.length > 20 ? content.substring(0, 17) + '...' : content
    conversationObject.lastMessageAt = newMessage.createdAt
    await conversationObject.save()

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username avatar email')
      .populate('receiver', 'username avatar email')

    const io = req.app.get('io')
    // 转为JS对象以发送
    const messageForEmit = populatedMessage.toObject()
    messageForEmit.newMessageSent = true
    // WebSocket 推送给接收者
    const receiverIdString = receiverObjectId.toString()
    const receiverSockets = getUserSockets(receiverIdString)
    if (receiverSockets && receiverSockets.size > 0) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit('receive-message', messageForEmit)
        console.log(
          `消息已通过socket ${socketId} 推送给接收者 ${receiverIdString}`
        )
      })
    } else {
      console.log(`接收者 ${receiverIdString} 当前没有活动的 socket。`)
    }

    // 推送消息到发送者自己的其他在线 socket 连接
    const senderIdString = senderObjectId.toString()
    const senderSockets = getUserSockets(senderIdString)
    if (senderSockets && senderSockets.size > 0) {
      senderSockets.forEach((socketId) => {
        io.to(socketId).emit('receive-message', messageForEmit)
        console.log(
          `消息已同步给发送者 ${senderIdString} 的 socket ${socketId}`
        )
      })
    }
    response.success(res, populatedMessage, '消息发送成功')
  } catch (error) {
    console.error('发送消息时出现错误', error)
    response.error(res, '发送消息失败')
  }
}

// 获取指定会话的消息列表（分页加载）
const getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.currentUserObjectId
    const conversationId = req.conversation

    const page = parseInt(req.query.page, 10) || 1 // 默认第一页
    const limit = parseInt(req.query.limit, 10) || 20 // 默认每页20条消息
    const skip = (page - 1) * limit // 跳过的条数

    const messagesFromDB = await Message.find({
      conversationId: conversationId._id
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')

    const messages = messagesFromDB.map((msg) => {
      // 将 Mongoose 文档转换为 js object
      const messageObject = msg.toObject()
      messageObject.isSentByMe =
        msg.sender && msg.sender._id && msg.sender._id.equals(currentUserId)
      return messageObject
    })

    const totalMessages = await Message.countDocuments({
      conversationId
    })
    const totalPages = Math.ceil(totalMessages / limit)

    response.success(
      res,
      {
        messages: messages.reverse(), // 按时间顺序加载旧消息
        currentPage: page,
        totalPages,
        totalMessages,
        limit
      },
      '会话消息获取成功'
    )
  } catch (error) {
    console.error('会话消息获取失败', error)
    response.error(res, '消息获取失败')
  }
}

const markConversationAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const { conversationId } = req.params
    // 将未读消息标记为已读
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        readAt: null
      },
      {
        $set: { readAt: new Date() }
      }
    )
    // 通知前端会话未读数已更新
    const io = req.app.get('io')
    const userSockets = getUserSockets(currentUserId)
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        io.to(socketId).emit('conversation_read', { conversationId })
      })
    }

    response.success(
      res,
      {
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount
      },
      200,
      '消息标记为已读'
    )
  } catch (error) {
    console.error(error)
    return response.error(res, '消息标记已读失败')
  }
}
module.exports = {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markConversationAsRead
}
