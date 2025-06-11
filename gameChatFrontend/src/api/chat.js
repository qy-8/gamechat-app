import request from '../utils/request'

// 拿到用户所有会话列表
export const getUserConversations = () => {
  return request.get('/api/chat/conversations')
}

// 拿到用户所激活会话的消息列表
export const getMessagesForConversation = (
  conversationId,
  page = 1,
  limit = 20
) => {
  return request.get(`/api/chat/conversations/${conversationId}/messages`, {
    params: {
      page,
      limit
    }
  })
}

// 获取或创建会话
export const getOrCreateConversation = (targetUserId) => {
  return request.post('/api/chat/conversations', {
    targetUserId
  })
}

// 发送消息
export const sendMessage = (conversationData) => {
  const { conversationId, content, messageType } = conversationData
  return request.post(`/api/chat/conversations/${conversationId}/messages`, {
    content,
    messageType
  })
}

// 将消息标记为已读
export const markAsRead = (conversationId) => {
  return request.post(`/api/chat/conversations/${conversationId}/read`)
}
