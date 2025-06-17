import persist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

const pinia = createPinia()
// 持久化
pinia.use(persist)

export default pinia

// 仓库统一导出
export * from './modules/user'
export * from './modules/group'
export * from './modules/chat'
export * from './modules/friend'
export * from './modules/channel'
