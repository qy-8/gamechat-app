import axios from 'axios'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'

const baseURL = import.meta.env.VITE_BASE_API

// 创建实例，包括基础地址和超时时间
const request = axios.create({
  baseURL,
  timeout: 100000,
  withCredentials: true // 所有请求默认携带 cookie
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const UserStore = useUserStore()
    // 如果有token的话，在请求头添加token
    if (UserStore.token) {
      config.headers.Authorization = UserStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
request.interceptors.response.use(
  // 成功响应
  function (response) {
    if (response.data.status === 'success') {
      return response.data
    }
    // 展示错误信息
    ElMessage.error(response?.data?.message || '服务异常')
    return Promise.reject(response.data)
  },
  function (error) {
    // 如果 http 响应头状态码为 401
    if (error.response?.status === 401) {
      router.push('/login')
    }
    ElMessage({
      message: error.response?.data?.message || '错误异常',
      type: 'error',
      offset: 20
    })

    return Promise.reject(error.response?.data)
  }
)

export default request
