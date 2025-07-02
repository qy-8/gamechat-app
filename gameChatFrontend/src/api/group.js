import request from '../utils/request'

/**
 * @module GroupAPI
 * @description 包含与群组和频道管理相关的 API 请求。
 */

/**
 * @typedef {object} CreateGroupRequest
 * @property {string} name - 群组名称。
 * @property {string} description - 群组简介。
 */

/**
 * @typedef {object} CreateChannelRequest
 * @property {string} name - 频道名称。
 * @property {string} groupId - 群组ID。
 */

/**
 * @typedef {object} UploadGroupAvatarRequest
 * @property {string} groupId - 群组ID。
 * @property {FormData} avatar - 包含头像文件（字段名为 'avatar'）的 FormData 对象。
 */

/**
 * @typedef {object} SendGroupInvitationRequest
 * @property {string} groupId - 群组ID。
 * @property {string[]} inviteeIds - 被邀请的用户ID数组。
 */

/**
 * @typedef {object} SearchGroupMembersRequest
 * @property {string} groupId - 群组ID。
 * @property {string} q - 搜索关键字（匹配用户名）。
 * @property {number} [page=1] - 当前页码（默认为 1）。
 * @property {number} [limit=5] - 每页返回数量（默认为 5）。
 */

/**
 * @typedef {object} GroupInvitationResponseRequest
 * @property {string} groupId - 群组ID。
 * @property {'accept'|'decline'} action - 用户对群组邀请的响应，"accept"表示接受，"decline"表示拒绝。
 */

/**
 * @typedef {object} KickGroupMemberRequest
 * @property {string} groupId - 群组ID。
 * @property {string} memberId - 要移除的用户 ID。
 */

/**
 * @typedef {object} UpdateGroupInfoRequest
 * @property {string} groupId - 群组ID。
 * @property {string} name - 新的群组名称（最长 10 个字符）。
 * @property {string} description - 群组简介（最长 15 个字符）。
 */

/**
 * 创建群聊。
 * @function createGroup
 * @param {CreateGroupRequest} data - 请求体数据，包含群组名称和简介。
 * @returns {Promise<object>} 包含群组创建结果的 Promise 对象。
 */
export const createGroup = (data) => {
  return request.post('/api/groups/', data, { showGlobalLoading: true })
}

/**
 * 获取用户所有群组。
 * @function getUserGroups
 * @returns {Promise<object>} 包含用户所属群组列表的 Promise 对象。
 */
export const getUserGroups = () => {
  return request.get('/api/groups/mine')
}

/**
 * 创建当前群组的频道。
 * @function createChannel
 * @param {CreateChannelRequest} data - 请求体数据，包含频道名称和群组ID。
 * @returns {Promise<object>} 包含频道创建结果的 Promise 对象。
 */
export const createChannel = (data) => {
  return request.post('/api/groups/channel', data, { showGlobalLoading: true })
}

/**
 * 获取当前群组的所有频道。
 * @function getChannelList
 * @param {string} groupId - 群组的 ID。
 * @returns {Promise<object>} 包含频道列表的 Promise 对象。
 */
export const getChannelList = (groupId) => {
  return request.get(`api/groups/channel/${groupId}/channels`)
}

/**
 * 删除当前所选频道。
 * @function deleteChannel
 * @param {string} channelId - 要删除的频道ID。
 * @returns {Promise<object>} 包含频道删除结果的 Promise 对象。
 */
export const deleteChannel = (channelId) => {
  return request.delete(`/api/groups/channel/${channelId}`, {
    showGlobalLoading: true
  })
}

/**
 * 上传群组头像。
 * @function uploadGroupAvatar
 * @param {UploadGroupAvatarRequest} data - 上传群组头像数据，包含群组ID和头像文件。
 * @returns {Promise<object>} 包含头像上传结果的 Promise 对象。
 */
export const uploadGroupAvatar = (data) => {
  const { groupId, avatar } = data
  return request.post(`api/groups/${groupId}/avatar`, avatar, {
    showGlobalLoading: true
  })
}

/**
 * 获取用户所属群组的所有用户（群组详情）。
 * @function getGroupMembers
 * @param {string} groupId - 群组ID。
 * @returns {Promise<object>} 包含群组详细信息和成员列表的 Promise 对象。
 */
export const getGroupMembers = (groupId) => {
  return request.get(`/api/groups/${groupId}`)
}

/**
 * 批量邀请用户加入群组。
 * @function sendGroupInvitation
 * @param {SendGroupInvitationRequest} data - 邀请数据，包含群组ID和被邀请的用户ID数组。
 * @returns {Promise<object>} 包含邀请结果的 Promise 对象。
 */
export const sendGroupInvitation = (data) => {
  const { groupId, inviteeIds } = data
  return request.post(`/api/groups/${groupId}/invitations`, { inviteeIds })
}

/**
 * 模糊搜索群组成员。
 * @function searchGroupMembers
 * @param {SearchGroupMembersRequest} data - 搜索参数，包含群组ID、搜索关键字、页码和每页数量。
 * @returns {Promise<object>} 包含搜索结果列表的 Promise 对象。
 */
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

/**
 * 获取当前用户的群组邀请。
 * @function getGroupInvitations
 * @returns {Promise<object>} 包含待处理群组邀请列表的 Promise 对象。
 */
export const getGroupInvitations = () => {
  return request.get('/api/groups/invitations/pending')
}

/**
 * 响应群组邀请（接受或拒绝）。
 * @function groupInvitationResponse
 * @param {GroupInvitationResponseRequest} data - 响应数据，包含群组ID和操作动作。
 * @returns {Promise<object>} 包含响应结果的 Promise 对象。
 */
export const groupInvitationResponse = (data) => {
  const { groupId, action } = data
  return request.post(`/api/groups/${groupId}/invitations/response`, {
    action
  })
}

/**
 * 踢除群组成员。
 * @function kickGroupMember
 * @param {KickGroupMemberRequest} data - 踢人数据，包含群组ID和要移除的用户 ID。
 * @returns {Promise<object>} 包含踢人操作结果的 Promise 对象。
 */
export const kickGroupMember = (data) => {
  const { groupId, memberId } = data
  return request.delete(`/api/groups/${groupId}/members/${memberId}`, {
    showGlobalLoading: true
  })
}

/**
 * 更新群组信息。
 * @function updateGroupInfo
 * @param {UpdateGroupInfoRequest} data - 更新数据，包含群组ID、新的群组名称和描述。
 * @returns {Promise<object>} 包含更新结果的 Promise 对象。
 */
export const updateGroupInfo = (data) => {
  const { groupId, name, description } = data
  return request.patch(
    `api/groups/${groupId}/info`,
    { name, description },
    { showGlobalLoading: true }
  )
}

/**
 * 解散群组。
 * @function disbandGroup
 * @param {string} groupId - 要解散的群组 ID。
 * @returns {Promise<object>} 包含解散操作结果的 Promise 对象。
 */
export const disbandGroup = (groupId) => {
  return request.delete(`api/groups/${groupId}`, { showGlobalLoading: true })
}
