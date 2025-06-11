import { dataType } from 'element-plus/es/components/table-v2/src/common.mjs'
import request from '../utils/request'

// 获得图形验证码
export const fetchCaptcha = () => {
  return request.get('/api/captcha')
}

// 获得短信验证码
export const sendSmsCode = (data) => {
  return request.post('/api/auth/register/phone', data)
}

// 注册
export const registerUser = (data) => {
  return request.post('/api/auth/register', data)
}

// 使用手机号登陆
export const loginByPhone = (data) => {
  return request.post('/api/auth/login/phone', data)
}

// 使用用户名登陆
export const loginByUsername = (data) => {
  return request.post('/api/auth/login/username', data)
}

// 重设密码
export const resetPassword = (data) => {
  // console.log(data)
  return request.put('/api/auth/users/me/password', data)
}
