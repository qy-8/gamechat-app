import request from '../utils/request'

/**
 * @module FriendAPI
 * @description 包含与好友管理相关的 API 请求。
 */

/**
 * @typedef {object} FriendInfo
 * @property {string} _id - 好友的用户ID。
 * @property {string} username - 好友的用户名。
 * @property {string} [avatar] - 好友的头像URL（可选）。
 */

/**
 * @typedef {object} SearchFriendQueryParams
 * @property {string} q - 要搜索的用户名关键词，支持全词匹配（不区分大小写）。
 */

/**
 * @typedef {object} SendFriendRequestPayload
 * @property {string} receiverId - 目标用户的ID。
 */

/**
 * @typedef {object} FriendRequestInfo
 * @property {string} _id - 好友请求ID。
 * @property {string} requester - 请求者ID。
 * @property {string} recipient - 接收者ID。
 * @property {string} status - 请求状态（例如："pending"）。
 * @property {FriendInfo} [requesterInfo] - 请求者的详细信息（可能在某些返回中包含）。
 * @property {string} [requestedAt] - 请求时间（ISO 8601格式字符串）。
 */

/**
 * @typedef {object} HandleFriendRequestPayload
 * @property {string} requestId - 好友请求ID。
 * @property {'accept'|'decline'} action - 处理动作，"accept"表示接受，"decline"表示拒绝。
 */

/**
 * @typedef {object} UpdateFriendStatusPayload
 * @property {string} friendId - 目标好友的用户ID。
 * @property {'friends'|'blocked'} status - 好友状态，"blocked"表示拉黑，"friends"表示恢复好友状态。
 */

/**
 * 获取好友列表。
 * @function getFriendList
 * @returns {Promise<object>} 包含用户好友列表的 Promise 对象。
 */
export const getFriendList = () => {
  return request.get('/api/friends')
}

/**
 * 搜索好友。
 * @function searchFriend
 * @param {string} username - 要搜索的用户名。
 * @returns {Promise<object>} 包含搜索结果（用户列表）的 Promise 对象。
 */
export const searchFriend = (username) => {
  return request.get('/api/friends/search', {
    params: {
      q: username
    }
  })
}

/**
 * 发送好友请求。
 * @function sendFriendRequest
 * @param {string} receiverId - 目标用户的ID。
 * @returns {Promise<object>} 包含发送好友请求结果的 Promise 对象。
 */
export const sendFriendRequest = (receiverId) => {
  return request.post('/api/friends/requests', { receiverId })
}

/**
 * 获取收到的好友请求列表。
 * @function getFriendRequestList
 * @returns {Promise<object>} 包含收到的好友请求列表的 Promise 对象。
 */
export const getFriendRequestList = () => {
  return request.get('/api/friends/requests/incoming')
}

/**
 * 回应好友请求（接受或拒绝）。
 * @function handleFriendRequest
 * @param {HandleFriendRequestPayload} actionInfo - 包含请求ID和操作动作。
 * @returns {Promise<object>} 包含处理结果的 Promise 对象。
 */
export const handleFriendRequest = (actionInfo) => {
  const { requestId, action } = actionInfo
  return request.put(`/api/friends/requests/${requestId}`, { action })
}

/**
 * 删除好友。
 * @function deleteFriend
 * @param {string} friendId - 要删除的好友的用户ID。
 * @returns {Promise<object>} 包含删除操作结果的 Promise 对象。
 */
export const deleteFriend = (friendId) => {
  return request.delete(`/api/friends/${friendId}`)
}

/**
 * 更新好友状态（拉黑或取消拉黑）。
 * @function updateFriendStatus
 * @param {UpdateFriendStatusPayload} updateInfo - 包含好友ID和要更新的状态。
 * @returns {Promise<object>} 包含更新结果的 Promise 对象。
 */
export const updateFriendStatus = (updateInfo) => {
  const { friendId, status } = updateInfo
  return request.put(
    `/api/friends/${friendId}/status`,
    { status },
    { showGlobalLoading: true }
  )
}

/**
 * 获取黑名单列表。
 * @function getBlackList
 * @returns {Promise<object>} 包含黑名单用户列表的 Promise 对象。
 */
export const getBlackList = () => {
  return request.get('/api/friends/blackList')
}
