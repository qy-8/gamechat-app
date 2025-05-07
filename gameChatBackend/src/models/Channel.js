const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 频道名称
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    }, // 关联的群组
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }, // 关联的创建人
    status: { type: Number, enum: [0, 1], default: 1 } // 0: 禁用, 1: 正常
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt
)

module.exports = mongoose.model('Channel', channelSchema)
