/**
 * @file main.js
 * @description 应用程序的入口文件。
 * 负责创建 Vue 应用实例，引入全局样式，初始化 Pinia 状态管理和 Vue Router 路由。
 * @module MainApplication
 */
import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css' // 引入 normalize.css 重置浏览器默认样式
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑主题样式
import '@/assets/styles/theme.scss' // 自定义主题样式
import '@/assets/styles/global.scss' // 引入全局样式
// import './assets/styles/dark.scss' // 暗黑自定义样式
import 'element-plus/es/components/message/style/css' // ElMessage 样式
import './plugins/dayjs'
import pinia from '@/stores/index'
import router from './router/index'

/**
 * @constant {App} app
 * @description Vue 应用程序实例。
 */
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
