import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import Home from '@/views/Home.vue'
import Chat from '@/views/Chat.vue'

// 首页和聊天界面正常加载，其余不常用的页面懒加载
const routes = [
  {
    path: '/',
    component: Home,
    name: 'Home'
  },
  {
    path: '/auth',
    component: () => import('@/views/auth/auth.vue'),
    name: 'Login'
  },
  {
    path: '/chat',
    component: Chat,
    name: 'Chat',
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// TODO: 加载页面的loading

// 全局前置守卫拦截
router.beforeEach((to) => {
  const userStore = useUserStore()
  const isAuthenticated = !!userStore.token

  // 访问权限页面 - 需要登陆但无token则导航到login页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/auth'
  }
  // 默认导航到目标页面
})

export default router
