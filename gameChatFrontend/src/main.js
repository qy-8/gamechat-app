import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css' // 引入 normalize.css 重置浏览器默认样式
import '@/assets/styles/global.scss' // 引入全局样式
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑主题样式
import './assets/styles/dark.scss' // 暗黑自定义样式
import 'element-plus/es/components/message/style/css' // ElMessage 样式
import './plugins/dayjs'
import pinia from '@/stores/index'
import router from './router/index'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
