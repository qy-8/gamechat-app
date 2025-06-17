const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // 群组名称，必填，唯一
    description: { type: String, default: '' }, // 群组描述
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }, // 创建者，关联 User
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ], // 群组成员，关联 User
    avatar: { type: String, default: '' }, // 群组头像路径
    status: { type: Number, enum: [0, 1], default: 1 }, // 0: 禁用, 1: 正常
    pendingInvitations: [
      {
        inviter: {
          // 谁发起的邀请
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        invitee: {
          // 邀请了谁
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          // 邀请的创建时间
          type: Date,
          default: Date.now
        }
      }
    ],
    type: {
      type: String,
      default: 'group'
    }
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt
)

module.exports = mongoose.model('Group', groupSchema)
