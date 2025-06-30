// src/models/Message.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema(
  {
    conversationId: {
      // 会话 ID，关联到 Conversation 模型
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      index: true
    },
    sender: {
      // 消息发送者，关联到 User 模型
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      // 消息接收者，关联到 User 模型
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    content: {
      // 消息内容
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      // 消息类型
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    readAt: {
      // 接收者已读此消息的时间
      type: Date,
      default: null // 默认为 null，表示未读
    },
    repliedTo: {
      // 引用的消息
      messageId: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
      contentSnippet: { type: String, default: null }, // 被引用消息的内容片段
      senderId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      senderUsername: { type: String, default: null },
      senderAvatar: { type: String, default: null }
    }
  },
  {
    timestamps: true
  }
)

// 建立复合索引，降序排列 createdAt （消息发送时间）
// 快速获取一个会话内的消息列表，并按照发送时间倒序排列（最新消息在前）
messageSchema.index({ conversationId: 1, createdAt: -1 })
// 添加文本索引
messageSchema.index({ content: 'text' })

module.exports = mongoose.model('Message', messageSchema)
