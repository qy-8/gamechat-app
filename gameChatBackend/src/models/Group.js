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
    status: { type: Number, enum: [0, 1], default: 1 } // 0: 禁用, 1: 正常
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt
)

module.exports = mongoose.model('Group', groupSchema)
