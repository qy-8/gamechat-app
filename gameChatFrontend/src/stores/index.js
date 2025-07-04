/**
 * @file stores/index.js
 * @description Pinia 状态管理库的入口文件。
 * 初始化 Pinia 实例，并集成 `pinia-plugin-persistedstate` 用于状态持久化。
 * 同时统一导出所有 Pinia 模块 Store。
 * @module PiniaStore
 */

import persist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

/**
 * @constant {Pinia} pinia
 * @description 应用程序的 Pinia 实例。
 */
const pinia = createPinia()

// 使用 Pinia 持久化插件
pinia.use(persist)

export default pinia

// 统一导出所有 Pinia 模块 Store，方便在其他文件中导入
export * from './modules/user'
export * from './modules/group'
export * from './modules/chat'
export * from './modules/friend'
export * from './modules/channel'
export * from './modules/themeStore'
export * from './modules/useApp'
