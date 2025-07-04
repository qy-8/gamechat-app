/**
 * @file router/index.js
 * @description 配置 Vue Router 实例，定义应用程序的所有路由及其导航守卫。
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
const Home = () => import('@/views/Home.vue')
const Chat = () => import('@/views/Chat.vue')
const ChannelList = () => import('@/components/ChannelList.vue')
const FriendList = () => import('@/components/FriendList.vue')

/**
 * 定义应用程序的路由。
 * @type {Array<Object>}
 */
const routes = [
  {
    path: '/',
    component: Home,
    name: 'Home'
  },
  {
    path: '/auth',
    component: () => import('@/views/auth/auth.vue'),
    name: 'Auth',
    redirect: '/auth/login', // 默认重定向到登录页
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/auth/Login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../views/auth/Register.vue')
      }
    ]
  },
  {
    path: '/chat',
    component: Chat,
    name: 'Chat',
    children: [
      {
        path: '',
        name: 'ChannelList',
        component: ChannelList
      },
      {
        path: 'friends',
        name: 'FriendList',
        component: FriendList
      }
    ],
    meta: { requiresAuth: true } // 需要认证才能访问此路由及其子路由
  }
]

/**
 * 创建 Vue Router 实例。
 * 使用 history 模式，提供更友好的 URL。
 * @type {Router}
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置路由守卫。
 * 在每次路由导航前执行，用于处理认证检查和状态同步。
 * @param {RouteLocationNormalized} to - 即将进入的目标路由对象。
 * @param {RouteLocationNormalizedLoaded} from - 当前导航正要离开的路由对象。
 * @param {Function} next - 钩子函数，用于解析当前的导航。
 * @returns {string|void} 如果需要重定向，返回目标路径字符串；否则不返回。
 */
router.beforeEach((to) => {
  const userStore = useUserStore()
  const isAuthenticated = !!userStore.token // 检查用户是否已认证（是否有 token）

  // 同步 Pinia Store 与 localStorage 中的用户认证状态
  const local = JSON.parse(localStorage.getItem('user') || '{}')
  if (!local.token && userStore.token) {
    userStore.logout()
  }

  // 访问权限页面 - 需要登陆但无token则导航到login页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/auth'
  }
  // 默认导航到目标页面
})

export default router
