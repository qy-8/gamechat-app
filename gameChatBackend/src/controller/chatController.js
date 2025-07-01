const Conversation = require('../models/Conversation')
const User = require('../models/User')
const mongoose = require('mongoose')
const response = require('../utils/response')
const Message = require('../models/Message')
const { getUserSockets } = require('../utils/socketManager')
const { createAndBroadcastMessage } = require('../services/messageService')

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

    const participants = [
      new mongoose.Types.ObjectId(currentUserId),
      new mongoose.Types.ObjectId(targetUserId)
    ]

    let conversation = await Conversation.findOne({
      participants: { $all: participants },
      type: 'private'
    })

    let wasCreated = false

    // 如果会话不存在就创建新会话
    if (!conversation) {
      const newConversation = new Conversation({
        participants,
        lastMessageAt: Date.now(),
        type: 'private'
      })
      conversation = await newConversation.save()
      wasCreated = true
    }

    const populateConversation = await Conversation.findById(
      conversation._id
    ).populate('participants', 'username avatar')

    const successMessage = wasCreated ? '会话创建成功' : '会话获取成功'

    const conversationObject = populateConversation.toObject()

    conversationObject.targetParticipant = conversationObject.participants.find(
      (p) => p._id.toString() !== currentUserId
    )
    response.success(res, conversationObject, successMessage)
  } catch (error) {
    console.error('会话获取或创建失败', error)
    response.error(res, '服务器内部错误，无法获取或创建会话', 500)
  }
}

// controller/chatController.js

const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId

    // 1. 保持你原来的初始查询，它已经能拿到所有需要的数据
    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate({
        path: 'participants',
        select: 'username avatar'
      })
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt messageType readAt',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      })
      .populate('groupId', 'name avatar')
      .sort({ lastMessageAt: -1 })

    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // 2. ✅ 【核心】先将所有你希望返回的、公共的字段准备好

        // a. 保持你原来的 unreadCount 计算逻辑
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: currentUserId,
          sender: { $ne: currentUserId },
          readAt: null
        })

        // b. 准备好 lastMessage 对象，包含你计算的 isReadByCurrentUser
        const lastMessage = conv.lastMessage
          ? {
              _id: conv.lastMessage._id,
              content: conv.lastMessage.content,
              sender: conv.lastMessage.sender,
              createdAt: conv.lastMessage.createdAt,
              messageType: conv.lastMessage.messageType,
              isReadByCurrentUser:
                conv.lastMessage.sender._id.toString() === currentUserId
                  ? true
                  : !!conv.lastMessage.readAt
            }
          : null

        // c. 把所有通用的字段组合成一个基础对象
        const baseConversation = {
          _id: conv._id,
          lastMessage,
          lastMessageContentSnippet: conv.lastMessageContentSnippet,
          lastMessageAt: conv.lastMessageAt,
          updatedAt: conv.updatedAt,
          unreadCount
        }

        // 3. ✅ 现在，只在 if/else if 中处理【有差异】的字段

        if (conv.type === 'private') {
          const targetParticipant = conv.participants.find(
            (p) => p && p._id && p._id.toString() !== currentUserId
          )

          // 返回基础对象 + 私聊特有的字段
          return {
            ...baseConversation,
            type: 'private',
            targetParticipant: targetParticipant
              ? {
                  _id: targetParticipant._id,
                  username: targetParticipant.username,
                  avatar: targetParticipant.avatar
                }
              : null
          }
        } else if (conv.type === 'group') {
          // 返回基础对象 + 群聊特有的字段
          return {
            ...baseConversation,
            type: 'group',
            name: conv.name,
            avatar: conv.groupId?.avatar,
            groupInfo: conv.groupId
          }
        }

        return null
      })
    )

    response.success(
      res,
      processedConversations.filter(Boolean),
      '获取会话列表成功'
    )
  } catch (error) {
    console.error('获取会话列表失败:', error)
    response.error(res, '获取会话列表失败')
  }
}

// // 获取当前用户的会话列表
// const getUserConversations = async (req, res) => {
//   try {
//     const currentUserId = req.user.userId

//     const conversations = await Conversation.find({
//       participants: currentUserId
//     })
//       .populate({
//         path: 'participants',
//         select: 'username avatar'
//       }) // conversations 是包含了两个参与者的数组 - 私信
//       .populate({
//         path: 'lastMessage',
//         select: 'content sender createdAt messageType readAt',
//         populate: {
//           path: 'sender',
//           select: 'username avatar'
//         }
//       })
//       .populate('groupId', 'name avatar') // 群组
//       .sort({ lastMessageAt: -1 }) // 按照发送消息时间倒序排列（最新会话在前）

//     const processedConversations = await Promise.all(
//       conversations.map(async (conv) => {
//         const unreadCount = await Message.countDocuments({
//           conversationId: conv._id,
//           receiver: currentUserId, // 消息的接收者是当前用户
//           sender: { $ne: currentUserId },
//           readAt: null
//         })

//         const convObject = conv.toObject()

//         if (conv.type === 'private') {
//           const targetParticipant = conv.participants.find(
//             (p) => p && p._id && p._id.toString() !== currentUserId
//           )

//           return {
//             _id: conv._id,
//             type: 'private',
//             targetParticipant: targetParticipant
//               ? {
//                   _id: targetParticipant._id,
//                   username: targetParticipant.username,
//                   avatar: targetParticipant.avatar
//                 }
//               : null,
//             lastMessage: conv.lastMessage
//               ? {
//                   _id: conv.lastMessage._id,
//                   content: conv.lastMessage.content,
//                   sender: conv.lastMessage.sender,
//                   createdAt: conv.lastMessage.createdAt,
//                   messageType: conv.lastMessage.messageType,
//                   isReadByCurrentUser:
//                     conv.lastMessage.sender._id.toString() === currentUserId
//                       ? true
//                       : conv.lastMessage.readAt
//                         ? true
//                         : false
//                 }
//               : null,
//             lastMessageContentSnippet: conv.lastMessageContentSnippet,
//             lastMessageAt: conv.lastMessageAt,
//             updatedAt: conv.updatedAt,
//             unreadCount
//           }
//         } else if (conv.type === 'group') {
//           return {
//             _id: conv._id,
//             type: 'group',
//             lastMessage: conv.lastMessage
//               ? {
//                   _id: conv.lastMessage._id,
//                   content: conv.lastMessage.content,
//                   sender: conv.lastMessage.sender,
//                   createdAt: conv.lastMessage.createdAt,
//                   messageType: conv.lastMessage.messageType,
//                   isReadByCurrentUser:
//                     conv.lastMessage.sender._id.toString() === currentUserId
//                       ? true
//                       : conv.lastMessage.readAt
//                         ? true
//                         : false
//                 }
//               : null,
//             lastMessageContentSnippet: conv.lastMessageContentSnippet,
//             lastMessageAt: conv.lastMessageAt,
//             updatedAt: conv.updatedAt,
//             unreadCount,
//             name: convObject.name,
//             avatar: convObject.groupId?.avatar,
//             groupInfo: convObject.groupId
//           }
//         }
//       })
//     )
//     response.success(res, processedConversations, '获取会话列表成功')
//   } catch (error) {
//     console.error('获取会话列表失败', error)
//     response.error(res, '获取会话列表失败')
//   }
// }

// // 获取当前用户的会话列表
// const getUserConversations = async (req, res) => {
//   try {
//     const currentUserId = req.user.userId

//     const conversations = await Conversation.find({
//       participants: currentUserId
//     })
//       .populate({
//         path: 'participants',
//         select: 'username avatar'
//       }) // conversations 是包含了两个参与者的数组 - 私信
//       .populate({
//         path: 'lastMessage',
//         select: 'content sender createdAt messageType readAt',
//         populate: {
//           path: 'sender',
//           select: 'username avatar'
//         }
//       })
//       .populate('groupId', 'name avatar') // 群组
//       .sort({ lastMessageAt: -1 }) // 按照发送消息时间倒序排列（最新会话在前）

//     const processedConversations = await Promise.all(
//       conversations.map(async (conv) => {
//         if (conv.type === 'private') {
//           const targetParticipant = conv.participants.find(
//             (p) => p && p._id && p._id.toString() !== currentUserId
//           )
//           const unreadCount = await Message.countDocuments({
//             conversationId: conv._id,
//             receiver: currentUserId, // 消息的接收者是当前用户
//             sender: { $ne: currentUserId },
//             readAt: null
//           })

//           return {
//             _id: conv._id,
//             type: 'private',
//             targetParticipant: targetParticipant
//               ? {
//                   _id: targetParticipant._id,
//                   username: targetParticipant.username,
//                   avatar: targetParticipant.avatar
//                 }
//               : null,
//             lastMessage: conv.lastMessage
//               ? {
//                   _id: conv.lastMessage._id,
//                   content: conv.lastMessage.content,
//                   sender: conv.lastMessage.sender,
//                   createdAt: conv.lastMessage.createdAt,
//                   messageType: conv.lastMessage.messageType,
//                   isReadByCurrentUser:
//                     conv.lastMessage.sender._id.toString() === currentUserId
//                       ? true
//                       : conv.lastMessage.readAt
//                         ? true
//                         : false
//                 }
//               : null,
//             lastMessageContentSnippet: conv.lastMessageContentSnippet,
//             lastMessageAt: conv.lastMessageAt,
//             updatedAt: conv.updatedAt,
//             unreadCount
//           }
//         } else if (conv.type === 'group') {
//           return {
//             _id: conv._id,
//             type: 'group',
//             lastMessage: conv.lastMessage
//               ? {
//                   _id: conv.lastMessage._id,
//                   content: conv.lastMessage.content,
//                   sender: conv.lastMessage.sender,
//                   createdAt: conv.lastMessage.createdAt,
//                   messageType: conv.lastMessage.messageType,
//                   isReadByCurrentUser:
//                     conv.lastMessage.sender._id.toString() === currentUserId
//                       ? true
//                       : conv.lastMessage.readAt
//                         ? true
//                         : false
//                 }
//               : null,
//             lastMessageContentSnippet: conv.lastMessageContentSnippet,
//             lastMessageAt: conv.lastMessageAt,
//             updatedAt: conv.updatedAt,
//             unreadCount,
//             name: convObject.name,
//             avatar: convObject.groupId?.avatar,
//             groupInfo: convObject.groupId
//           }
//         }
//       })
//     )
//     response.success(res, processedConversations, '获取会话列表成功')
//   } catch (error) {
//     console.error('获取会话列表失败', error)
//     response.error(res, '获取会话列表失败')
//   }
// }

// // 获取当前用户的会话列表
// const getUserConversations = async (req, res) => {
//   try {
//     const currentUserId = req.user.userId

//     const conversations = await Conversation.find({
//       participants: currentUserId,
//       type: 'private'
//     })
//       .populate({
//         path: 'participants',
//         select: 'username avatar'
//       }) // conversations 是包含了两个参与者的数组
//       .populate({
//         path: 'lastMessage',
//         select: 'content sender createdAt messageType readAt',
//         populate: {
//           path: 'sender',
//           select: 'username avatar'
//         }
//       })
//       .sort({ lastMessageAt: -1 }) // 按照发送消息时间倒序排列（最新会话在前）

//     const processedConversations = await Promise.all(
//       conversations.map(async (conv) => {
//         const targetParticipant = conv.participants.find(
//           (p) => p && p._id && p._id.toString() !== currentUserId
//         )
//         const unreadCount = await Message.countDocuments({
//           conversationId: conv._id,
//           receiver: currentUserId, // 消息的接收者是当前用户
//           sender: { $ne: currentUserId },
//           readAt: null
//         })

//         return {
//           _id: conv._id,
//           type: 'private',
//           targetParticipant: targetParticipant
//             ? {
//                 _id: targetParticipant._id,
//                 username: targetParticipant.username,
//                 avatar: targetParticipant.avatar
//               }
//             : null,
//           lastMessage: conv.lastMessage
//             ? {
//                 _id: conv.lastMessage._id,
//                 content: conv.lastMessage.content,
//                 sender: conv.lastMessage.sender,
//                 createdAt: conv.lastMessage.createdAt,
//                 messageType: conv.lastMessage.messageType,
//                 isReadByCurrentUser:
//                   conv.lastMessage.sender._id.toString() === currentUserId
//                     ? true
//                     : conv.lastMessage.readAt
//                       ? true
//                       : false
//               }
//             : null,
//           lastMessageContentSnippet: conv.lastMessageContentSnippet,
//           lastMessageAt: conv.lastMessageAt,
//           updatedAt: conv.updatedAt,
//           unreadCount
//         }
//       })
//     )
//     response.success(res, processedConversations, '获取会话列表成功')
//   } catch (error) {
//     console.error('获取会话列表失败', error)
//     response.error(res, '获取会话列表失败')
//   }
// }

// 在指定会话中发送消息
const sendMessage = async (req, res) => {
  try {
    const senderObjectId = req.currentUserObjectId
    const conversationObject = req.conversation
    const { content, messageType, repliedTo = [] } = req.body

    if (!content || content.trim() === '') {
      return response.error(res, '消息内容不能为空', 400)
    }

    const finalMessage = await createAndBroadcastMessage({
      conversationId: conversationObject._id,
      senderId: senderObjectId,
      content,
      messageType,
      repliedTo,
      io: req.app.get('io')
    })
    response.success(res, finalMessage, '消息发送成功')
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

      '消息标记为已读'
    )
  } catch (error) {
    console.error(error)
    return response.error(res, '消息标记已读失败')
  }
}

// 发送消息到频道
const sendMessageInChannel = async (req, res) => {
  try {
    const { channelId } = req.params
    const {
      content,
      messageType = 'text',
      mentionIds,
      repliedTo = []
    } = req.body
    console.log(2, repliedTo)
    const senderId = req.user.userId

    if (!content || !content.trim()) {
      return response.error(res, '消息内容不能为空', 400)
    }

    // 查找频道
    const channel = await Conversation.findById(channelId).populate({
      path: 'groupId',
      select: 'members'
    })

    if (!channel || !channel.groupId) {
      return response.error(res, '该频道不存在', 404)
    }

    // 验证发送消息的人是否为群组成员
    const isMember = channel.groupId.members.some((id) => id.equals(senderId))
    if (!isMember) {
      return response.error(res, '用户不是群组成员', 404)
    }

    const finalMessage = await createAndBroadcastMessage({
      conversationId: channelId,
      senderId,
      content,
      messageType,
      mentionIds,
      repliedTo,
      io: req.app.get('io')
    })

    response.success(res, finalMessage, '消息发送成功')
  } catch (error) {
    console.error(error)
    return response.error(res, '无法发送信息，服务器错误')
  }
}

const searchMessagesInConversation = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { q: searchTerm, page = 1, limit = 20 } = req.query
    const currentUserId = req.user.userId

    if (!searchTerm || searchTerm.trim() === '') {
      return response.error(res, '请输入要搜索的关键词', 400)
    }

    const parsedPage = parseInt(page, 10) || 1
    const parsedLimit = parseInt(limit, 10) || 20
    const skip = (parsedPage - 1) * parsedLimit

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return response.error(res, '当前会话不存在', 404)
    }

    const currentUserIdObjectId = new mongoose.Types.ObjectId(currentUserId)
    const isMember = conversation.participants.some((p) =>
      p.equals(currentUserIdObjectId)
    )

    if (!isMember) {
      return response.error(res, '当前用户不是会话成员', 403)
    }

    const queryConditions = {
      conversationId,
      $text: { $search: searchTerm }
    }

    const [foundMessages, totalResults] = await Promise.all([
      Message.find(queryConditions, { score: { $meta: 'textScore' } }) // 获取搜索得分
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 }) // 优先按得分，其次按时间倒序
        .skip(skip)
        .limit(parsedLimit)
        .populate('sender', 'username avatar'), // 填充发送者信息
      Message.countDocuments(queryConditions) // 计算总数
    ])

    const totalPages = Math.ceil(totalResults / parsedLimit)

    return response.success(
      res,
      {
        messages: foundMessages,
        currentPage: parsedPage,
        totalPages,
        totalResults
      },
      '消息搜索成功'
    )
  } catch (error) {
    console.error(error)
    return response.error(res, '服务器错误，搜索失败')
  }
}

const toggleMuteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { mute } = req.body
    const currentUserId = req.user.userId

    if (typeof mute !== 'boolean') {
      return response.error(res, 'mute 字段必须是一个布尔值 (true/false)', 400)
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return response.error(res, '无效的会话ID格式', 400)
    }
    let updateOperation

    if (mute === true) {
      updateOperation = { $addToSet: { mutedConversations: conversationId } }
    } else if (mute === false) {
      updateOperation = { $pull: { mutedConversations: conversationId } }
    }
    await User.findByIdAndUpdate(currentUserId, updateOperation)

    const message = mute ? '会话已设为免打扰' : '已取消免打扰'
    response.success(res, { muted: mute }, message)
  } catch (error) {
    console.error(error)
    response.error(res, '操作失败')
  }
}

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markConversationAsRead,
  sendMessageInChannel,
  searchMessagesInConversation,
  toggleMuteConversation
}
