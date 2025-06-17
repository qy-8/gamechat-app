import { defineStore } from 'pinia'
import { ref } from 'vue'
import { deleteChannel, getChannelList } from '@/api/group'

export const useChannelStore = defineStore('channel', () => {
  const activeChannel = ref(null)
  const channelList = ref([])

  const getGroupChannels = async (groupId) => {
    try {
      const response = await getChannelList(groupId)
      channelList.value = response.data
    } catch (error) {
      console.error('获取频道列表失败:', error)
    }
  }

  const deleteGroupChannel = async (channelId) => {
    try {
      await deleteChannel(channelId)
      channelList.value = channelList.value.filter(
        (channel) => channel._id !== channelId
      )
    } catch (error) {
      console.error('获取频道列表失败:', error)
    }
  }

  const setActiveChannel = async (currentChannel) => {
    activeChannel.value = currentChannel
  }

  return {
    activeChannel,
    channelList,
    getGroupChannels,
    deleteGroupChannel,
    setActiveChannel
  }
})
