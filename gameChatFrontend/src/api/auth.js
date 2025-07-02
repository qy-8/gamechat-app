import request from '../utils/request'

/**
 * @module AuthAPI
 * @description 包含与用户认证相关的 API 请求。
 */

/**
 * @typedef {object} FetchCaptchaResponse
 * @property {string} svg - 图形验证码的 SVG 字符串。
 * @property {string} captchaId - 验证码ID，可能用于后续验证。
 */

/**
 * @typedef {object} SendSmsCodeRequest
 * @property {string} phone - 用户手机号。
 * @property {string} captcha - 图形验证码。
 */

/**
 * @typedef {object} RegisterRequest
 * @property {string} phoneNumber - 手机号码。
 * @property {string} code - 短信验证码。
 * @property {string} username - 用户名。
 * @property {string} password - 密码。
 */

/**
 * @typedef {object} LoginByPhoneRequest
 * @property {string} phoneNumber - 手机号码。
 * @property {string} [code] - 短信验证码（可选，与密码二选一）。
 * @property {string} [password] - 密码（可选，与短信验证码二选一）。
 */

/**
 * @typedef {object} LoginByUsernameRequest
 * @property {string} username - 用户名。
 * @property {string} password - 密码。
 */

/**
 * @typedef {object} ResetPasswordRequest
 * @property {string} newPwd - 新密码。
 * @property {string} phoneNumber - 手机号码。
 * @property {string} code - 手机验证码。
 */

/**
 * 获得图形验证码。
 * @function fetchCaptcha
 * @returns {Promise<FetchCaptchaResponse>} 包含图形验证码 SVG 和可能 ID 的 Promise 对象。
 */
export const fetchCaptcha = () => {
  return request.get('/api/captcha')
}

/**
 * 发送短信验证码。
 * @function sendSmsCode
 * @param {SendSmsCodeRequest} data - 请求体数据，包含手机号和图形验证码。
 * @returns {Promise<object>} 包含短信发送结果的 Promise 对象。
 */
export const sendSmsCode = (data) => {
  return request.post('/api/auth/register/phone', data)
}

/**
 * 注册新用户。
 * @function registerUser
 * @param {RegisterRequest} data - 请求体数据，包含手机号、短信验证码、用户名和密码。
 * @returns {Promise<object>} 包含注册结果的 Promise 对象。
 */
export const registerUser = (data) => {
  return request.post('/api/auth/register', data)
}

/**
 * 使用手机号登录。
 * @function loginByPhone
 * @param {LoginByPhoneRequest} data - 请求体数据，包含手机号和可选的短信验证码或密码。
 * @returns {Promise<object>} 包含登录结果（包括 Token）的 Promise 对象。
 */
export const loginByPhone = (data) => {
  return request.post('/api/auth/login/phone', data, {
    showGlobalLoading: true
  })
}

/**
 * 使用用户名登录。
 * @function loginByUsername
 * @param {LoginByUsernameRequest} data - 请求体数据，包含用户名和密码。
 * @returns {Promise<object>} 包含登录结果（包括 Token）的 Promise 对象。
 */
export const loginByUsername = (data) => {
  return request.post('/api/auth/login/username', data, {
    showGlobalLoading: true
  })
}

/**
 * 重设密码。
 * @function resetPassword
 * @param {ResetPasswordRequest} data - 请求体数据，包含新密码、手机号和验证码。
 * @returns {Promise<object>} 包含重设密码结果的 Promise 对象。
 */
export const resetPassword = (data) => {
  return request.put('/api/auth/users/me/password', data, {
    showGlobalLoading: true
  })
}
