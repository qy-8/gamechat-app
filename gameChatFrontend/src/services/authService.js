import { sendSmsCode } from '../api/auth'

// 点击获取验证码按钮获取短信验证码 - 测试阶段短信验证码在后端Terminal内模拟发送
export const getCode = async (data) => {
  console.log('getCode 函数接收到的 data', data)
  try {
    const response = await sendSmsCode(data)
    console.log('验证码已发送（开发阶段打印）')
  } catch (error) {
    console.error('获取短信验证码失败:', error)
  }
}
