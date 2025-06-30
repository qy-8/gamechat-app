const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const response = require('../utils/response')
const { getUserSockets } = require('../utils/socketManager')

async function createAndBroadcastMessage(data) {
  const {
    conversationId,
    senderId,
    content,
    messageType,
    mentionIds = [],
    repliedTo = [],
    io
  } = data
  console.log(mentionIds)
  // 查找会话，获取
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    throw new Error('会话不存在')
  }

  console.log(1, repliedTo)
  // 创建并保存新消息
  const newMessage = new Message({
    conversationId,
    sender: senderId,
    content,
    messageType,
    mentions: mentionIds,
    repliedTo,
    receiver:
      conversation.type === 'private'
        ? conversation.participants.find((p) => !p.equals(senderId))
        : undefined
  })
  await newMessage.save()

  // 更新会话的最新消息时间戳和内容
  // await Conversation.updateOne(
  //   { _id: channelId },
  //   { lastMessageAt: newMessage.createdAt }
  // )
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: newMessage._id,
    lastMessageAt: newMessage.createdAt,
    lastMessageContentSnippet:
      content.length > 20 ? content.substring(0, 17) + '...' : content
  })

  let populatedMessage
  let messageForEmit

  if (conversation.type === 'private') {
    populatedMessage = await newMessage.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'receiver', select: 'username avatar' }
    ])
    messageForEmit = {
      ...populatedMessage.toObject(),
      newMessageSent: true,
      conversationType: 'private'
    }

    const receiverIdString = populatedMessage.receiver._id.toString()
    const receiverSockets = getUserSockets(receiverIdString)
    if (receiverSockets && receiverSockets.size > 0) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit('new_message', messageForEmit)
        console.log(
          `消息已通过socket ${socketId} 推送给接收者 ${receiverIdString}`
        )
      })
    } else {
      console.log(`接收者 ${receiverIdString} 当前没有活动的 socket。`)
    }

    // 推送消息到发送者自己的其他在线 socket 连接
    const senderIdString = senderId.toString()
    const senderSockets = getUserSockets(senderIdString)
    if (senderSockets && senderSockets.size > 0) {
      senderSockets.forEach((socketId) => {
        io.to(socketId).emit('new_message', messageForEmit)
        console.log(
          `消息已同步给发送者 ${senderIdString} 的 socket ${socketId}`
        )
      })
    }
  } else if (conversation.type === 'group') {
    // 填充消息
    populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username avatar')
      .populate({
        path: 'conversationId',
        select: 'name type groupId',
        populate: {
          path: 'groupId',
          select: 'name avatar'
        }
      })

    messageForEmit = {
      ...populatedMessage.toObject(),
      conversationType: populatedMessage.conversationId.type,
      groupInfo: populatedMessage.conversationId.groupId,
      conversationId: populatedMessage.conversationId._id.toString()
    }
    io.to(conversationId).emit('new_message', messageForEmit)
    console.log(`已向房间 ${conversationId} 广播了新消息`)
    // if (mentionIds && mentionIds.length > 0) {
    //   console.log(3, mentionIds)

    //   const mentionNotificationPayload = {
    //     mentionedBy: messageForEmit.sender,
    //     channel: {
    //       id: messageForEmit.conversationId._id
    //     },
    //     group: {
    //       id: messageForEmit.groupInfo._id,
    //       name: messageForEmit.groupInfo.name
    //     },
    //     message: messageForEmit
    //   }

    //   for (const mentionedUserId of mentionIds) {
    //     // 找到用户 sockets
    //     console.log(4, mentionIds)

    //     const recipientSockets = getUserSockets(mentionedUserId.toString())
    //     if (recipientSockets) {
    //       // 发送被 mentioned 的事件
    //       recipientSockets.forEach((socketId) => {
    //         io.to(socketId).emit(
    //           'you_were_mentioned',
    //           mentionNotificationPayload
    //         )
    //       })
    //       console.log(`已向用户 ${mentionedUserId} 发送了 @ 提醒`)
    //     }
    //   }
    // }
  }

  return messageForEmit
}

module.exports = {
  createAndBroadcastMessage
}
