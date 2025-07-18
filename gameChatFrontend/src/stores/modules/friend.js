/**
 * @file stores/modules/friendStore.js
 * @description Pinia Store，用于管理用户的好友列表、好友请求以及相关操作。
 * @module FriendStore
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores' // useUserStore 已导入但未使用，如果确实不需要，可以考虑移除。
import {
  getFriendRequestList,
  getFriendList,
  deleteFriend as apiDeleteFriend
} from '../../api/friend'
import { ElMessage } from 'element-plus'
import emitter from '../../services/eventBus'

/**
 * @function useFriendStore
 * @description Pinia Store，用于管理用户的好友关系，包括好友列表、好友请求和未读请求计数。
 * @returns {{
 * friendList: Ref<Array<object>>,
 * friendRequestList: Ref<Array<object>>,
 * unreadRequestCount: Ref<number>,
 * getList: Function,
 * getIncomingRequests: Function,
 * clearUnreadRequestCount: Function,
 * handleNewRequest: Function,
 * addNewFriend: Function,
 * deleteFriend: Function
 * }}
 * @property {Ref<Array<object>>} friendList - 当前用户的好友列表。
 * @property {Ref<Array<object>>} friendRequestList - 当前用户收到的好友请求列表。
 * @property {Ref<number>} unreadRequestCount - 未处理的好友请求数量。
 * @property {Function} getList - 从后端获取并更新好友列表。
 * @property {Function} getIncomingRequests - 从后端获取并更新收到的好友请求列表，并更新未读请求计数。
 * @property {Function} clearUnreadRequestCount - 清除未读好友请求计数。
 * @property {Function} handleNewRequest - 处理新的实时好友请求，将其添加到列表中并发送通知。
 * @property {Function} addNewFriend - 将新朋友添加到好友列表。
 * @property {Function} deleteFriend - 从后端删除好友并更新本地列表。
 */
export const useFriendStore = defineStore('friend', () => {
  // --- 状态 (State) ---
  /** @type {Ref<Array<object>>} */
  const friendList = ref([]) // 当前用户的好友列表
  /** @type {Ref<Array<object>>} */
  const friendRequestList = ref([]) // 当前用户收到的好友请求列表
  /** @type {Ref<number>} */
  const unreadRequestCount = ref(0) // 未处理的好友请求数量

  // Actions

  /**
   * @function getList
   * @description 从后端 API 获取当前用户的好友列表，并更新 `friendList` 状态。
   * @returns {Promise<void>}
   * @throws {Error} 如果获取好友列表失败，会打印错误信息。
   */
  const getList = async () => {
    try {
      const response = await getFriendList() // 调用 API 获取好友列表
      friendList.value = response.data // 更新好友列表
    } catch (error) {
      console.error('获取好友列表失败:', error)
    }
  }

  /**
   * @function getIncomingRequests
   * @description 从后端 API 获取当前用户收到的好友请求列表，并更新 `friendRequestList`。
   * 同时更新 `unreadRequestCount` 为当前请求列表的长度。
   * @returns {Promise<void>}
   * @throws {Error} 如果获取请求列表失败，会打印错误信息。
   */
  const getIncomingRequests = async () => {
    try {
      const response = await getFriendRequestList() // 调用 API 获取好友请求列表
      friendRequestList.value = response.data // 更新好友请求列表
      unreadRequestCount.value = friendRequestList.value.length // 更新未读请求计数
    } catch (error) {
      console.error('获取好友请求列表失败:', error)
    }
  }

  /**
   * @function clearUnreadRequestCount
   * @description 将未读好友请求计数重置为 0。
   * @returns {void}
   */
  const clearUnreadRequestCount = async () => {
    unreadRequestCount.value = 0
  }

  /**
   * @function handleNewRequest
   * @description 处理新的实时好友请求。
   * 将新请求添加到 `friendRequestList` 的最前面，增加未读计数，并发送桌面通知。
   * @param {object} newRequestData - 新的好友请求数据。
   * @param {object} newRequestData.requester - 请求者的用户信息（包含 username）。
   * @returns {void}
   */
  const handleNewRequest = (newRequestData) => {
    friendRequestList.value.unshift(newRequestData) // 将新请求添加到列表开头
    unreadRequestCount.value++ // 增加未读计数

    // 发送全局通知事件，提醒用户有新的好友请求
    emitter.emit('show-notification', {
      title: '新的好友请求',
      message: `用户 ${newRequestData.requester.username} 想添加你为好友`
    })
  }

  /**
   * @function addNewFriend
   * @description 将新的好友添加到本地 `friendList`。
   * 在添加前会检查好友是否已存在，避免重复。
   * @param {object} newFriend - 新添加的好友对象。
   * @returns {void}
   */
  const addNewFriend = (newFriend) => {
    // 检查好友是否已存在，避免重复添加
    if (!friendList.value.some((f) => f._id === newFriend._id)) {
      friendList.value.unshift(newFriend) // 添加到列表开头
    }
  }

  /**
   * @function deleteFriend
   * @description 根据好友 ID 从后端删除好友，并更新本地 `friendList`。
   * @param {string} friendId - 要删除的好友的 ID。
   * @returns {Promise<void>}
   * @throws {Error} 如果删除好友失败，会打印错误信息。
   */
  const deleteFriend = async (friendId) => {
    try {
      await apiDeleteFriend(friendId) // 调用 API 删除好友
      // 从本地列表中过滤掉已删除的好友
      friendList.value = friendList.value.filter((f) => f._id !== friendId)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error(error)
    }
  }

  // --- 返回 Store 的状态和操作 ---
  return {
    friendList,
    friendRequestList,
    unreadRequestCount,
    getList,
    getIncomingRequests,
    clearUnreadRequestCount,
    handleNewRequest,
    addNewFriend,
    deleteFriend
  }
})
