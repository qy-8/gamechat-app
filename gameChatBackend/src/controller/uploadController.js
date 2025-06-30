const response = require('../utils/response')
const ossClient = require('../utils/ossClient')
const path = require('path')
const fs = require('fs')
const Conversation = require('../models/Conversation')
const { createAndBroadcastMessage } = require('../services/messageService')

const uploadChatMessageImage = async (req, res) => {
  const file = req.file
  const userId = req.user.userId
  const { conversationId } = req.params

  if (!file) {
    return response.error(res, '没有检测到上传的文件', 400)
  }

  // 查找频道
  const conversation = await Conversation.findById(conversationId)

  // .populate({
  //   path: 'groupId',
  //   select: 'members'
  // })

  if (!conversation) {
    fs.unlinkSync(file.path)
    return response.error(res, '该频道不存在', 404)
  }

  // 验证发送消息的人的权限
  const isMember = conversation.participants.some((id) => id.equals(userId))
  if (!isMember) {
    fs.unlinkSync(file.path)
    return response.error(res, '您尚未参与会话，无法发送图片', 404)
  }

  const fileExtension = path.extname(file.originalname)
  const ossFileName = `chat-images/${userId}/${Date.now()}${fileExtension}`

  try {
    // 上传到OSS
    const result = await ossClient.put(ossFileName, file.path)
    const imageUrl = result.url

    console.log(`聊天图片上传成功，URL: ${imageUrl}`)

    const populatedMessage = await createAndBroadcastMessage({
      conversationId: conversationId,
      senderId: userId,
      content: imageUrl,
      messageType: 'image', // 明确消息类型是 'image'
      io: req.app.get('io')
    })

    // 把 URL 返回给前端
    response.success(res, populatedMessage, '图片上传成功')
  } catch (error) {
    console.error('上传聊天图片失败:', error)
    response.error(res, '图片上传失败', 500)
  } finally {
    fs.unlinkSync(file.path)
  }
}

module.exports = { uploadChatMessageImage }
