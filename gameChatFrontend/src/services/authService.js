/**
 * @file services/authService.js
 * @description 认证服务相关的实用函数，封装了与认证 API 的交互。
 * @module AuthService
 */

import { sendSmsCode } from '../api/auth'

/**
 * @function getCode
 * @description 调用后端 API 发送短信验证码。
 * 在测试阶段，短信验证码会在后端服务的终端中模拟显示。
 * @param {object} data - 发送短信验证码所需的数据。
 * @param {string} data.phoneNumber - 接收短信验证码的手机号码。
 * @param {string} data.captcha - 用户输入的图形验证码。
 * @returns {Promise<void>} 一个 Promise，表示短信发送操作的完成。
 * @throws {Error} 如果发送短信验证码的 API 请求失败，会打印错误信息到控制台。
 */
export const getCode = async (data) => {
  try {
    const response = await sendSmsCode(data)
  } catch (error) {
    console.error('获取短信验证码失败:', error)
  }
}
