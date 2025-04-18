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
export const loginByUsername = (data) =>
  request.post('/api/auth/login/username', data)
