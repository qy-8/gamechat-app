import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { deleteChannel, getChannelList } from '@/api/group'
import { useGroupStore, useChatStore } from '@/stores'

export const useChannelStore = defineStore('channel', () => {
  const activeChannel = ref(null)
  const groupStore = useGroupStore()
  const chatStore = useChatStore()
  const { activeGroup } = storeToRefs(groupStore)
  const { conversations } = storeToRefs(chatStore)

  const channelList = computed(() => {
    if (!activeGroup.value?._id) {
      return []
    }
    return conversations.value.filter(
      (conv) =>
        conv.type === 'group' && conv.groupInfo?._id === activeGroup.value._id
    )
  })

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
    deleteGroupChannel,
    setActiveChannel
  }
})
