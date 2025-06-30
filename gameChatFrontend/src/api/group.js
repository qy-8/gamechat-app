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

// 上传群组头像
export const uploadGroupAvatar = (data) => {
  const { groupId, avatar } = data
  return request.post(`api/groups/${groupId}/avatar`, avatar)
}

// 获取用户所属群组的所有用户
export const getGroupMembers = (groupId) => {
  return request.get(`/api/groups/${groupId}`)
}

// 批量邀请用户加入群组
export const sendGroupInvitation = (data) => {
  const { groupId, inviteeIds } = data
  return request.post(`/api/groups/${groupId}/invitations`, { inviteeIds })
}

// 模糊搜索群组成员
export const searchGroupMembers = (data) => {
  const { groupId, q, page = 1, limit = 5 } = data
  return request.get(`/api/groups/${groupId}/members`, {
    params: {
      q,
      page,
      limit
    }
  })
}

// 获取当前用户的群组邀请
export const getGroupInvitations = () => {
  return request.get('/api/groups/invitations/pending')
}

// 响应群组邀请
export const groupInvitationResponse = (data) => {
  const { groupId, action } = data
  return request.post(`/api/groups/${groupId}/invitations/response`, {
    action
  })
}

export const kickGroupMember = (data) => {
  const { groupId, memberId } = data
  return request.delete(`/api/groups/${groupId}/members/${memberId}`)
}

export const updateGroupInfo = (data) => {
  const { groupId, name, description } = data
  return request.patch(`api/groups/${groupId}/info`, { name, description })
}

export const disbandGroup = (groupId) => {
  console.log(groupId)
  return request.delete(`api/groups/${groupId}`)
}
