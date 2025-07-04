/**
 * @file stores/modules/channelStore.js
 * @description Pinia Store，用于管理活跃群组频道和相关的频道操作。
 * 该 Store 维护活跃频道状态，根据活跃群组过滤频道列表，并提供频道管理操作。
 * @module ChannelStore
 */

import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { deleteChannel } from '@/api/group'
import { useGroupStore, useChatStore } from '@/stores'
/**
 * @function useChannelStore
 * @description Pinia Store，用于管理群组频道。
 * 它提供活跃频道的状态，一个基于活跃群组计算的频道列表，以及删除频道和设置活跃频道的操作。
 *  @returns {{
 * activeChannel: Ref<object|null>,
 * channelList: ComputedRef<Array<object>>,
 * deleteGroupChannel: Function,
 * setActiveChannel: Function
 * }}
 * @property {Ref<object|null>} activeChannel - 当前活跃的频道对象。默认为 `null`。
 * @property {ComputedRef<Array<object>>} channelList - 计算属性，返回属于活跃群组的群组频道对话列表。
 * @property {Function} deleteGroupChannel - 根据频道 ID 删除群组频道的操作。
 * @property {Function} setActiveChannel - 设置当前活跃频道的操作。
 */
export const useChannelStore = defineStore('channel', () => {
  const activeChannel = ref(null)
  const groupStore = useGroupStore()
  const chatStore = useChatStore()
  const { activeGroup } = storeToRefs(groupStore)
  const { conversations } = storeToRefs(chatStore)

  /**
   * @type {ComputedRef<Array<object>>}
   * @description 计算属性，过滤 `conversations`，只包含属于 `activeGroup` 的群组频道。
   */
  const channelList = computed(() => {
    // 如果没有活跃群组，返回空数组
    if (!activeGroup.value?._id) {
      return []
    }
    // 过滤对话，查找活跃群组的频道
    return conversations.value.filter(
      (conv) =>
        conv.type === 'group' && conv.groupInfo?._id === activeGroup.value._id
    )
  })

  /**
   * @watch activeGroup
   * @description 监听 `activeGroup` 的变化。
   * 当活跃群组改变且存在频道时，自动将列表中的第一个频道设置为 `chatStore` 中的活跃对话。
   * 这确保了在新群组被激活时，会默认选择一个频道。
   */
  watch(
    activeGroup,
    (newGroup) => {
      if (newGroup && channelList.value.length > 0) {
        // 切换群组时，自动将第一个频道设为当前聊天对象
        chatStore.setActiveConversation(channelList.value[0])
      }
    },
    { deep: true, immediate: true }
  )

  /**
   * @function deleteGroupChannel
   * @description 根据频道 ID 删除群组频道。
   * 成功从 API 删除后，会从本地 `channelList` 中移除该频道。
   * @param {string} channelId - 要删除的频道 ID。
   * @returns {Promise<void>} 一个 Promise，在频道删除时解决。
   * @throws {Error} 如果 API 调用失败，会在控制台记录错误。
   */
  const deleteGroupChannel = async (channelId) => {
    try {
      await deleteChannel(channelId)
      // 从本地列表中过滤掉已删除的频道
      channelList.value = channelList.value.filter(
        (channel) => channel._id !== channelId
      )
    } catch (error) {
      console.error('获取频道列表失败:', error)
    }
  }

  /**
   * @function setActiveChannel
   * @description 设置给定频道为当前选定的活跃频道。
   * @param {object} currentChannel - 要设置为活跃状态的频道对象。
   * @returns {void}
   */
  const setActiveChannel = async (currentChannel) => {
    activeChannel.value = currentChannel
  }

  return {
    activeChannel,
    channelList,
    deleteGroupChannel,
    setActiveChannel
  }
})
