import { sendSmsCode } from '../api/auth'

// 点击获取验证码按钮获取短信验证码 - 测试阶段短信验证码在后端Terminal内模拟发送
export const getCode = async (data) => {
  try {
    const response = await sendSmsCode(data)
  } catch (error) {
    console.error('获取短信验证码失败:', error)
  }
}
