/**
 * @file utils/request.js
 * @description 配置 Axios HTTP 请求实例，包括基础 URL、超时设置、请求/响应拦截器。
 * 负责全局加载状态管理、认证 token 注入和统一错误处理。
 * @module Request
 */

import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores'
import { ElMessage } from 'element-plus'

/**
 * @constant {string} baseURL
 * @description API 请求的基础 URL，从环境变量中获取。
 */
const baseURL = import.meta.env.VITE_BASE_API

/**
 * @constant {AxiosInstance} request
 * @description 创建 Axios 请求实例。
 * 配置了基础 URL、超时时间，并默认携带 cookie。
 */
const request = axios.create({
  baseURL,
  timeout: 15000, // 请求超时时间
  withCredentials: true // 所有请求默认携带 cookie
})

/**
 * Axios 请求拦截器。
 * 在请求发送前执行，用于：
 * 1. 控制全局加载动画。
 * 2. 在请求头中注入认证 token。
 */
request.interceptors.request.use(
  /**
   * @function requestInterceptorSuccess
   * @description 请求成功拦截器。
   * @param {AxiosRequestConfig} config - 请求配置对象。
   * @param {boolean} [config.showGlobalLoading=false] - 自定义配置，控制是否显示全局加载动画。
   * @returns {AxiosRequestConfig} 修改后的请求配置对象。
   */
  (config) => {
    const appStore = useAppStore()
    // 根据配置决定是否显示全局加载动画
    if (config.showGlobalLoading) {
      appStore.startLoading()
    }

    const token = localStorage.getItem('token')
    // 如果存在 token，则在请求头中添加 Authorization 字段
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  /**
   * @function requestInterceptorError
   * @description 请求失败拦截器。
   * @param {any} err - 请求错误对象。
   * @returns {Promise<never>} 返回一个被拒绝的 Promise。
   */
  (err) => {
    const appStore = useAppStore()
    // 如果请求配置存在且开启了全局加载，则停止加载动画
    if (err.config && err.config.showGlobalLoading) {
      appStore.stopLoading()
    }
    return Promise.reject(err)
  }
)

/**
 * Axios 响应拦截器。
 * 在接收到响应后执行，用于：
 * 1. 停止全局加载动画。
 * 2. 处理成功的业务响应。
 * 3. 统一处理业务错误和 HTTP 错误（如 401）。
 */
request.interceptors.response.use(
  /**
   * @function responseInterceptorSuccess
   * @description 响应成功拦截器。
   * @param {AxiosResponse} response - 响应对象。
   * @param {boolean} [response.config.showGlobalLoading=false] - 请求配置，控制是否显示全局加载动画。
   * @returns {object|Promise<never>} 如果业务状态为 'success'，返回响应数据；否则，显示错误信息并返回被拒绝的 Promise。
   */
  function (response) {
    const appStore = useAppStore()
    // 如果请求配置存在且开启了全局加载，则停止加载动画
    if (response.config.showGlobalLoading) {
      appStore.stopLoading()
    }

    // 检查后端返回的业务状态码
    if (response.data.status === 'success') {
      return response.data
    }
    // 业务失败，显示错误信息
    ElMessage.error(response?.data?.message || '服务异常')
    return Promise.reject(response.data) // 返回被拒绝的 Promise，传递后端返回的错误数据
  },
  /**
   * @function responseInterceptorError
   * @description 响应失败拦截器。
   * @param {AxiosError} error - 错误对象。
   * @param {boolean} [error.config.showGlobalLoading=false] - 请求配置，控制是否显示全局加载动画。
   * @returns {Promise<never>} 返回一个被拒绝的 Promise。
   */
  function (error) {
    const appStore = useAppStore()
    // 如果请求配置存在且开启了全局加载，则停止加载动画
    if (error.config && error.config.showGlobalLoading) {
      appStore.stopLoading()
    }

    // 处理 HTTP 状态码为 401 (未授权) 的情况
    if (error.response?.status === 401) {
      // 清除本地存储中的用户认证信息
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      // 重定向到登录页面
      router.push('/auth')
    }
    // 关闭所有现有消息提示，避免重复弹窗
    ElMessage.closeAll()
    // 显示错误提示
    ElMessage({
      message: error.response?.data?.message || '错误异常',
      type: 'error',
      offset: 20 // 消息提示的偏移量
    })

    // 返回被拒绝的 Promise，传递响应中的错误数据
    return Promise.reject(error.response?.data)
  }
)

export default request
