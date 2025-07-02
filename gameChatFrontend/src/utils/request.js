import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores'
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
    const appStore = useAppStore()
    if (config.showGlobalLoading) {
      appStore.startLoading()
    }

    const token = localStorage.getItem('token')
    // 如果有token的话，在请求头添加token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => {
    const appStore = useAppStore()
    if (err.config && err.config.showGlobalLoading) {
      appStore.stopLoading()
    }
    return Promise.reject(err)
  }
)

// 响应拦截器
request.interceptors.response.use(
  // 成功响应
  function (response) {
    const appStore = useAppStore()
    if (response.config.showGlobalLoading) {
      appStore.stopLoading()
    }

    if (response.data.status === 'success') {
      return response.data
    }
    // 展示错误信息
    ElMessage.error(response?.data?.message || '服务异常')
    return Promise.reject(response.data)
  },
  function (error) {
    const appStore = useAppStore()
    if (error.config && error.config.showGlobalLoading) {
      // 检查 error.config 是否存在
      appStore.stopLoading()
    }

    // 如果 http 响应头状态码为 401
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      router.push('/auth')
    }
    ElMessage.closeAll()
    ElMessage({
      message: error.response?.data?.message || '错误异常',
      type: 'error',
      offset: 20
    })

    return Promise.reject(error.response?.data)
  }
)

export default request
