const mongoose = require('mongoose')
const Schema = mongoose.Schema

const friendshipSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'friends', 'declined', 'blocked', 'unfriended'],
      // default: 'unfriended',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date
    },
    deletedAt: {
      type: Date,
      default: null
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null // 默认 null 表示没有被拉黑
    }
  },
  { timestamps: true }
)

// 快速查找某个用户发出的请求/好友关系
friendshipSchema.index({ requester: 1, status: 1 })

// 快速查找某个用户收到的请求/好友关系
friendshipSchema.index({ recipient: 1, status: 1 })

const Friendship = mongoose.model('Friendship', friendshipSchema)

module.exports = Friendship
