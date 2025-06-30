// src/models/Conversation.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const conversationSchema = new Schema(
  {
    participants: [
      {
        // 参与者 (固定为2人，代表私聊)
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联到 User 模型
        required: true
      }
    ],
    type: {
      type: String,
      required: true,
      enum: ['private', 'group']
    },
    lastMessage: {
      // 指向最后一条消息的引用
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageContentSnippet: {
      // 最后一条消息的内容摘要，用于会话列表快速预览
      type: String,
      trim: true,
      maxlength: 100
    },
    lastMessageAt: {
      // 最后一条消息的发送时间
      type: Date,
      default: Date.now
    },
    name: {
      // 频道名
      type: String
    },
    groupId: {
      // 所属群组的ID
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }
  },
  {
    timestamps: true
  }
)

// 在执行 save 操作执行之前，确保参与者只有两位
// 在 save 执行前按照id排序参与者的 ID 以确保其唯一性，A - B / B - A 是同一个会话，然后创建复合唯一索引
conversationSchema.pre('save', function (next) {
  if (this.type === 'private') {
    if (this.participants && this.participants.length === 2) {
      // 将ObjectId转换为字符串进行比较和排序
      const participantIdsAsString = this.participants.map((id) =>
        id.toString()
      )
      participantIdsAsString.sort()
      // 将排序后的字符串ID转换回ObjectId
      this.participants = participantIdsAsString.map(
        (idStr) => new mongoose.Types.ObjectId(idStr)
      )
    } else if (this.isNew) {
      // 强制校验参与者数量
      // 当this为新建文档且参与人数不足两人，中断并传递 error 对象
      return next(new Error('会话参与者必须是两位。'))
    }
  }

  next()
})

// 为 participants 数组创建索引
// 用于查询某个用户的所有会话，最新会话在前
conversationSchema.index({ participants: 1, lastMessageAt: -1 })

module.exports = mongoose.model('Conversation', conversationSchema)
