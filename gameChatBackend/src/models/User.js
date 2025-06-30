const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // 用户名，必填，唯一
    password: { type: String, required: true }, // 密码，必填
    avatar: { type: String, default: '' }, // 头像，非必填
    phoneNumber: { type: String, default: '' }, // 电话号码，非必填
    favoriteGames: { type: [String], default: [] }, // 喜欢的游戏列表，非必填
    status: { type: Number, enum: [0, 1], default: 1 }, // 用户状态。0注销/1正常
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // 用户所在群组
    mutedConversations: [
      {
        // 存放 Conversation 的 ObjectId
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
      }
    ]
  },
  { timestamps: true } // 自动添加两个字段：createdAt 和 updatedAt
)

module.exports = mongoose.model('User', userSchema)
