import request from '../utils/request'

/**
 * @module UserAPI
 * @description 包含用户账户信息和操作相关的 API 请求。
 */

/**
 * @typedef {object} UserAvatarUploadPayload
 * @property {FormData} avatar - 包含头像文件（字段名为 'avatar'）的 FormData 对象。
 */

/**
 * @typedef {object} UserInfoResponseData
 * @property {string} _id - 用户ID。
 * @property {string} username - 用户名。
 * @property {string} [avatar] - 用户头像URL。
 * @property {string} phoneNumber - 手机号码。
 * @property {string[]} [favoriteGames] - 收藏的游戏列表（可选）。
 * @property {string[]} [groups] - 所属群组列表（可选）。
 */

/**
 * @typedef {object} UpdateUserInfoPayload
 * @property {string} username - 用户名。
 * @property {string} phoneNumber - 手机号码（中国格式）。
 * @property {string} [avatar] - 头像 URL (Swagger中被标记为 required，但这里可能指通过其他API更新后的URL)。
 */

/**
 * 更新用户头像。
 * @function uploadUserAvatar
 * @param {FormData} avatar - 包含头像文件（字段名为 'avatar'）的 FormData 对象。
 * @returns {Promise<object>} 包含头像上传结果和新头像 URL 的 Promise 对象。
 */
export const uploadUserAvatar = (avatar) => {
  return request.put('/api/auth/me/avatar', avatar, { showGlobalLoading: true })
}

/**
 * 获取用户信息。
 * @function getUserInfo
 * @returns {Promise<object>} 包含用户详细信息（如 ID、用户名、头像等）的 Promise 对象。
 */
export const getUserInfo = () => {
  return request.get('/api/auth/info')
}

/**
 * 更新用户信息。
 * @function updateUserInfo
 * @param {UpdateUserInfoPayload} data - 请求体数据，包含要更新的用户名和手机号码。
 * @returns {Promise<object>} 包含用户信息更新结果的 Promise 对象。
 */
export const updateUserInfo = (data) => {
  return request.put('/api/auth/update', data, { showGlobalLoading: true })
}

/**
 * 删除用户。
 * @function deleteUser
 * @returns {Promise<object>} 包含用户删除操作结果的 Promise 对象。
 */
export const deleteUser = () => {
  return request.delete('/api/auth/delete', { showGlobalLoading: true })
}
