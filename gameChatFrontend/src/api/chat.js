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

// 发送私信消息
export const sendMessage = (conversationData) => {
  const {
    conversationId,
    content,
    messageType,
    repliedTo = []
  } = conversationData
  return request.post(`/api/chat/conversations/${conversationId}/messages`, {
    content,
    messageType,
    repliedTo
  })
}

// 将消息标记为已读
export const markAsRead = (conversationId) => {
  return request.post(`/api/chat/conversations/${conversationId}/read`)
}

// 发送频道消息
export const sendMessageInChannel = (data) => {
  const {
    channelId,
    content,
    messageType = 'text',
    mentionIds,
    repliedTo = []
  } = data
  return request.post(`/api/chat/channels/${channelId}/messages`, {
    content,
    messageType,
    mentionIds,
    repliedTo
  })
}

// export const sendMessageInChannel = (data) => {
//   const { conversationId, channelId, content, messageType = 'text' } = data
//   return request.post(`/api/channels/${conversationId}/messages`, {
//     channelId,
//     content,
//     messageType
//   })
// }

export const uploadImageAPI = (data) => {
  const { conversationId, file } = data
  const formData = new FormData()
  formData.append('image', file)
  return request.post(`/api/chat/image/${conversationId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 搜索会话消息
export const searchMessage = (data) => {
  const { conversationId, searchTerm, page = 1, limit = 20 } = data
  return request.get(
    `api/chat/conversations/${conversationId}/messages/search`,
    {
      params: {
        q: searchTerm,
        page,
        limit
      }
    }
  )
}

// 静音/解除静音会话
export const toggleMuteConversation = (data) => {
  const { conversationId, mute } = data
  console.log(mute)
  return request.post(`api/chat/conversations/${conversationId}/mute`, {
    mute
  })
}
