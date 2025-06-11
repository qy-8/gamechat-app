import request from '../utils/request'

export const getFriendList = () => {
  return request.get('/api/friends')
}

export const searchFriend = (username) => {
  return request.get('/api/friends/search', {
    params: {
      q: username
    }
  })
}

export const sendFriendRequest = (receiverId) => {
  return request.post('/api/friends/requests', { receiverId })
}

export const getFriendRequestList = () => {
  return request.get('/api/friends/requests/incoming')
}

export const handleFriendRequest = (actionInfo) => {
  const { requestId, action } = actionInfo
  return request.put(`/api/friends/requests/${requestId}`, { action })
}

export const deleteFriend = (friendId) => {
  return request.delete(`/api/friends/${friendId}`)
}

export const updateFriendStatus = (updateInfo) => {
  const { friendId, status } = updateInfo
  return request.put(`/api/friends/${friendId}/status`, { status })
}

export const getBlackList = () => {
  return request.get('/api/friends/blackList')
}
