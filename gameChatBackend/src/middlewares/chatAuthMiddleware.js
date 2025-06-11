const mongoose = require('mongoose')
const Conversation = require('../models/Conversation')
const response = require('../utils/response')

const validateConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId
    const { conversationId } = req.params
    // 验证传过来的 id 的有效性
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return response.error(res, '会话 id 格式无效', 400)
    }

    const conversationObjectId = new mongoose.Types.ObjectId(conversationId)
    const senderObjectId = new mongoose.Types.ObjectId(currentUserId)

    // 查找会话
    const conversation = await Conversation.findById(conversationObjectId)
    if (!conversation) {
      return response.error(res, '会话不存在', 400)
    }

    // 验证用户是否为当前会话参与者之一
    const isParticipant = conversation.participants.some((participantId) =>
      participantId.equals(senderObjectId)
    )
    if (!isParticipant) {
      return response.error(res, '用户不是当前会话参与者', 403)
    }

    // 将验证过的会话对象和当前用户ObjectId附加到 req 对象
    req.conversation = conversation
    req.currentUserObjectId = currentUserId

    next()
  } catch (error) {
    console.error('会话权限校验中间件错误:', error)
    response.error(res, '服务器内部错误 (会话权限校验)。', 500)
  }
}

module.exports = validateConversation
