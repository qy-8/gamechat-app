import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref({
      username: ''
    })

    const isLoggedIn = computed(() => !!token.value)
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUserInfo = (newUserInfo) => {
      Object.assign(userInfo.value, newUserInfo)
    }
    const logout = () => {
      token.value = ''
      userInfo.value = { username: '' }
    }
    return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout }
  },
  {
    persist: true
  }
)
