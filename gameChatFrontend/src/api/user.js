import request from '../utils/request'

// 更新用户头像
export const uploadUserAvatar = (avatar) => {
  return request.put('/api/auth/me/avatar', avatar)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/api/auth/info')
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return request.put('/api/auth/update', data)
}

// 删除用户
export const deleteUser = () => {
  return request.delete('/api/auth/delete')
}
