import request from '../utils/request'

// 创建群聊
export const createGroup = (data) => {
  return request.post('/api/groups/', data)
}

// 获取用户所有群组
export const getUserGroups = () => {
  return request.get('/api/groups/mine')
}

// 创建当前群组的频道
export const createChannel = (data) => {
  return request.post('/api/groups/channel', data)
}

// 获取当前群组的所有频道
export const getChannelList = (groupId) => {
  return request.get(`api/groups/channel/${groupId}/channels`)
}

// 删除当前所选频道
export const deleteChannel = (channelId) => {
  return request.delete(`/api/groups/channel/${channelId}`)
}
