import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultUserInfo = {
  username: '用户',
  userId: '',
  avatar: import.meta.env.VITE_DEFAULT_USER_AVATAR
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 默认信息
    const userInfo = ref({ ...defaultUserInfo })
    const token = ref('')

    const isLoggedIn = computed(() => !!token.value)
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUserInfo = (newUserInfo) => {
      Object.assign(userInfo.value, newUserInfo)
    }
    const logout = () => {
      token.value = ''
      userInfo.value = { ...defaultUserInfo }
      localStorage.removeItem('token')
    }
    return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout }
  },
  {
    persist: true
  }
)
