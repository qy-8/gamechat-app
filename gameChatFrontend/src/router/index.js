import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
const Home = () => import('@/views/Home.vue')
const Chat = () => import('@/views/Chat.vue')
const ChannelList = () => import('@/components/ChannelList.vue')
const FriendList = () => import('@/components/FriendList.vue')

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
    name: 'Auth',
    redirect: '/auth/login',
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

  // 同步 store 与 localstorage
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
