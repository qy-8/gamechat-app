/**
 * @file stores/modules/userStore.js
 * @description Pinia Store，用于管理用户认证状态、用户信息和用户偏好设置（如会话免打扰）。
 * 该 Store 的状态支持持久化。
 * @module UserStore
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toggleMuteConversation } from '../../api/chat' // 导入切换免打扰 API
import { ElMessage } from 'element-plus' // 导入 Element Plus 消息组件

/**
 * @const {object} defaultUserInfo
 * @description 默认的用户信息对象，用于初始化或重置用户状态。
 * @property {string} username - 默认用户名。
 * @property {string} userId - 默认用户ID。
 * @property {string} avatar - 默认用户头像URL。
 */
const defaultUserInfo = {
  username: '用户',
  userId: '',
  avatar: import.meta.env.VITE_DEFAULT_USER_AVATAR
}

/**
 * @function useUserStore
 * @description Pinia Store，用于管理用户的认证状态、个人信息以及聊天免打扰设置。
 * 该 Store 的状态会被持久化到本地存储。
 * @returns {{
 * token: Ref<string>,
 * userInfo: Ref<object>,
 * isLoggedIn: ComputedRef<boolean>,
 * isMuted: ComputedRef<Function>,
 * setToken: Function,
 * setUserInfo: Function,
 * toggleMute: Function,
 * logout: Function
 * }}
 * @property {Ref<string>} token - 用户的认证 token。
 * @property {Ref<object>} userInfo - 用户的详细信息，包括用户名、ID、头像等。
 * @property {ComputedRef<boolean>} isLoggedIn - 计算属性，判断用户是否已登录。
 * @property {ComputedRef<Function>} isMuted - 计算属性，返回一个函数，用于检查指定会话是否处于免打扰状态。
 * @property {Function} setToken - 设置用户的认证 token。
 * @property {Function} setUserInfo - 设置用户的详细信息，并同步免打扰会话列表。
 * @property {Function} toggleMute - 切换指定会话的免打扰状态。
 * @property {Function} logout - 执行用户登出操作，清除所有用户相关状态。
 */
export const useUserStore = defineStore(
  'user',
  () => {
    // --- 状态 (State) ---
    /**
     * @type {Ref<object>}
     * @description 当前登录用户的详细信息。
     */
    const userInfo = ref({ ...defaultUserInfo })
    /**
     * @type {Ref<string>}
     * @description 当前用户的认证 token。
     */
    const token = ref('')
    /**
     * @type {Ref<Set<string>>}
     * @description 存储用户已设置为免打扰的会话ID集合。
     */
    const mutedConversations = ref(new Set())

    // --- 计算属性 (Getters) ---

    /**
     * @type {ComputedRef<boolean>}
     * @description 判断用户是否已登录（通过检查 token 是否存在）。
     */
    const isLoggedIn = computed(() => !!token.value)

    /**
     * @type {ComputedRef<Function>}
     * @description 返回一个函数，该函数接受 `conversationId`，用于检查对应会话是否已设置为免打扰。
     * @returns {function(string): boolean} 检查函数。
     */
    const isMuted = computed(() => {
      return (conversationId) => {
        if (!conversationId) return false
        return mutedConversations.value.has(conversationId)
      }
    })

    // --- 操作 (Actions) ---

    /**
     * @function setToken
     * @description 设置用户的认证 token。
     * @param {string} newToken - 新的认证 token 字符串。
     * @returns {void}
     */
    const setToken = (newToken) => {
      token.value = newToken
    }

    /**
     * @function setUserInfo
     * @description 设置用户的详细信息。
     * 如果新用户信息包含 `mutedConversations` 数组，则同步更新本地的免打扰会话集合。
     * @param {object} newUserInfo - 包含用户详细信息的新对象。
     * @param {string} newUserInfo.username - 用户名。
     * @param {string} newUserInfo.userId - 用户ID。
     * @param {string} newUserInfo.avatar - 用户头像URL。
     * @param {Array<string>} [newUserInfo.mutedConversations] - 用户已设置免打扰的会话ID列表。
     * @returns {void}
     */
    const setUserInfo = (newUserInfo) => {
      Object.assign(userInfo.value, newUserInfo) // 更新用户基本信息
      // 如果新信息包含免打扰列表，则将其转换为 Set 并更新
      if (
        newUserInfo.mutedConversations &&
        Array.isArray(newUserInfo.mutedConversations)
      ) {
        mutedConversations.value = new Set(newUserInfo.mutedConversations)
      }
    }

    /**
     * @function toggleMute
     * @description 切换指定会话的免打扰状态。
     * 会同时更新本地状态和调用后端 API。如果 API 调用失败，会回滚本地状态。
     * @param {string} conversationId - 要切换免打扰状态的会话 ID。
     * @param {boolean} mute - 如果为 `true` 则设为免打扰，如果为 `false` 则取消免打扰。
     * @returns {Promise<void>}
     * @throws {Error} 如果切换免打扰状态的 API 请求失败，会打印错误信息并显示提示。
     */
    const toggleMute = async (conversationId, mute) => {
      // 乐观更新：先更新本地状态，提供即时反馈
      if (mute) {
        mutedConversations.value.add(conversationId)
      } else if (mute === false) {
        mutedConversations.value.delete(conversationId)
      }

      try {
        await toggleMuteConversation({ conversationId, mute }) // 调用 API 更新后端状态
      } catch (error) {
        console.error('切换免打扰状态失败', error)
        // 如果 API 调用失败，回滚本地状态
        if (mute) {
          mutedConversations.value.delete(conversationId)
        } else if (mute === false) {
          mutedConversations.value.add(conversationId)
        }
        ElMessage.error('切换免打扰状态失败，请稍后重试')
      }
    }

    /**
     * @function logout
     * @description 执行用户登出操作。
     * 清除本地 token、用户信息和免打扰会话列表，并移除 localStorage 中的 token。
     * @returns {void}
     */
    const logout = () => {
      token.value = ''
      userInfo.value = { ...defaultUserInfo } // 重置为默认用户信息
      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('group')
      localStorage.removeItem('chat')
      localStorage.removeItem('theme')
      localStorage.removeItem('user')

      mutedConversations.value.clear() // 清空免打扰会话列表
    }

    // --- 返回 Store 的状态、计算属性和操作 ---
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
    // 该 Store 的所有状态都会被持久化到本地存储
    persist: true
  }
)
