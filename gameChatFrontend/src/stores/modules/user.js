import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toggleMuteConversation } from '../../api/chat'
import { ElMessage } from 'element-plus'

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
    const mutedConversations = ref(new Set())

    const isLoggedIn = computed(() => !!token.value)
    const isMuted = computed(() => {
      return (conversationId) => {
        if (!conversationId) return false
        return mutedConversations.value.has(conversationId)
      }
    })

    const setToken = (newToken) => {
      token.value = newToken
    }

    const setUserInfo = (newUserInfo) => {
      Object.assign(userInfo.value, newUserInfo)
      if (
        newUserInfo.mutedConversations &&
        Array.isArray(newUserInfo.mutedConversations)
      ) {
        mutedConversations.value = new Set(newUserInfo.mutedConversations)
      }
    }

    const toggleMute = async (conversationId, mute) => {
      if (mute) {
        mutedConversations.value.add(conversationId)
      } else if (mute === false) {
        mutedConversations.value.delete(conversationId)
      }

      try {
        await toggleMuteConversation({ conversationId, mute })
      } catch (error) {
        console.error('切换免打扰状态失败', error)
        if (mute) {
          mutedConversations.value.delete(conversationId)
        } else if (mute === false) {
          mutedConversations.value.add(conversationId)
        }
        ElMessage.error('切换免打扰状态失败，请稍后重试')
      }
    }

    const logout = () => {
      token.value = ''
      userInfo.value = { ...defaultUserInfo }
      localStorage.removeItem('token')
      mutedConversations.value.clear()
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      isMuted,
      setToken,
      setUserInfo,
      toggleMute,
      logout
    }
  },
  {
    persist: true
  }
)
