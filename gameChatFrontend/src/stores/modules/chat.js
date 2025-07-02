import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import {
  getMessagesForConversation,
  getUserConversations,
  markAsRead,
  searchMessage
} from '../../api/chat'
import { getOrCreateConversation } from '../../api/chat'
import emitter from '../../services/eventBus'

export const useChatStore = defineStore(
  'chat',
  () => {
    // 会话列表
    const conversations = ref([])
    const messages = ref([])
    const activeConversation = ref(null)
    const userStore = useUserStore()
    const isLoadingConversations = ref(false)
    const currentMessagePage = ref(1)
    const totalMessagePages = ref(1)
    const canLoadMoreMessages = ref(false)
    const isLoadingMessages = ref(false)
    const messageLimitPerPage = ref(20)
    const replyingToMessage = ref(null) // 准备恢复的消息内容
    const searchResults = ref([])
    const isSearchingMessages = ref(false)
    const currentSearchPage = ref(1)
    const totalSearchPages = ref(1)
    const canLoadMoreSearchResults = ref(false)
    const currentSearchTerm = ref('')

    // 打开的会话 Id
    // const activeConversationId = ref(null)
    const activeConversationPartner = ref({
      _id: '',
      username: '你的好友',
      avatar: '/images/defaultUserAvatar.png'
    })

    const handleNewRealTimeMessage = (newMessage) => {
      // 传进来的消息必须要是当前打开的会话
      if (newMessage.conversationId === activeConversation.value?._id) {
        // 检测是否有一样 id 的信息
        const exists = messages.value.some((m) => m._id === newMessage._id)

        if (!exists) {
          messages.value.push(newMessage)
        }
      }

      const conversationIndex = conversations.value.findIndex(
        (c) => c._id === newMessage.conversationId
      )
      if (conversationIndex !== -1) {
        // 拿到新消息所在的 conversation
        const updatedConversation = {
          ...conversations.value[conversationIndex]
        }

        updatedConversation.lastMessage = newMessage
        updatedConversation.lastMessageContentSnippet =
          newMessage.content.length > 30
            ? newMessage.content.substring(0, 27) + '...'
            : newMessage.content
        updatedConversation.lastMessageAt = newMessage.createdAt

        let notificationTitle = ''
        let notificationMessage = ''

        // 对于私聊和群聊两种消息类型做不同的通知处理
        if (newMessage.conversationType === 'group') {
          notificationTitle = `群组 [${newMessage.groupInfo?.name}] 有新消息，来自 ${newMessage.sender.username}`
        } else {
          notificationTitle = `有来自 ${newMessage.sender.username} 的新消息`
        }

        // 对于 image 和 text 两种消息类型做不同的通知处理
        if (newMessage.messageType === 'image') {
          notificationMessage = '[图片]'
        } else {
          notificationMessage = newMessage.content
        }

        // 判断当前消息是否属于当前打开的会话和是否为当前用户发送的，以决定是否需要增加未读消息计数
        if (
          newMessage.conversationId !== activeConversation.value?._id &&
          newMessage.sender._id !== userStore.userInfo.userId
        ) {
          updatedConversation.unreadCount =
            (updatedConversation.unreadCount || 0) + 1
          if (!userStore.isMuted(newMessage.conversationId)) {
            emitter.emit('show-notification', {
              title: notificationTitle,
              message: notificationMessage
            })
          }
        }

        // 移除新消息所在的会话然后把更新的对话放在数组最前面（消息列表按新 -> 旧顺序排列）
        conversations.value.splice(conversationIndex, 1)
        conversations.value.unshift(updatedConversation)
      } else {
        console.warn(
          `收到新消息，但会话 ${newMessage.conversationId} 不在当前列表内`
        )
      }
    }

    const getConversations = async () => {
      if (!userStore.isLoggedIn) {
        conversations.value = []
        return
      }
      isLoadingConversations.value = true
      try {
        const response = await getUserConversations()
        conversations.value = response.data
      } catch (error) {
        console.error(error)
      } finally {
        isLoadingConversations.value = false
      }
    }

    const getMessages = async (conversationId, pageToLoad = 1) => {
      if (!conversationId) {
        console.warn('conversationId 为空')
        isLoadingMessages.value = false
        return
      }
      isLoadingMessages.value = true
      try {
        const response = await getMessagesForConversation(
          conversationId,
          pageToLoad,
          messageLimitPerPage.value
        )
        if (pageToLoad === 1) {
          // 替换首页消息
          messages.value = response.data.messages
        } else {
          messages.value = [...response.data.messages, ...messages.value]
        }
        currentMessagePage.value = response.data.currentPage
        totalMessagePages.value = response.data.totalPages
        canLoadMoreMessages.value =
          response.data.currentPage < response.data.totalPages
      } catch (error) {
        if (pageToLoad === 1) {
          messages.value = []
        }
      } finally {
        isLoadingMessages.value = false
      }
    }

    const setActiveConversation = async (conversation) => {
      // 点击已激活会话不重复加载
      if (conversation._id === activeConversation.value?._id || !conversation) {
        return
      }

      if (conversation._id) {
        activeConversation.value = conversation
        messages.value = []
        currentMessagePage.value = 1
        totalMessagePages.value = 1
        canLoadMoreMessages.value = false
        isLoadingMessages.value = true
      }

      // 清除未读数
      const convInList = conversations.value.find(
        (c) => c._id === conversation._id
      )
      if (convInList && convInList.unreadCount > 0) {
        convInList.unreadCount = 0 // 在前端UI上清除未读消息标志
        markAsRead(conversation._id).catch((err) => {
          console.error('标记已读失败:', err)
        })
      }

      try {
        await getMessages(conversation._id, 1)
      } catch (error) {
        console.error(error)
      } finally {
        isLoadingMessages.value = false
      }
    }

    const selectFriendToChat = async (friend) => {
      if (!friend || !friend._id) {
        return
      }

      if (activeConversation.value?.targetParticipant?._id === friend._id) {
        return
      }

      try {
        const response = await getOrCreateConversation(friend._id)
        const newConversation = response.data

        const existInList = conversations.value.some(
          (c) => c._id === newConversation._id
        )
        if (!existInList) {
          conversations.value.unshift(newConversation)
        }
        await setActiveConversation(newConversation)
      } catch (error) {
        console.error(error)
      }
    }

    const selectGroupChannelToChat = async (channel) => {
      if (!channel || !channel._id) {
        return
      }
      if (activeConversation.value?._id === channel._id) {
        return
      }

      const channelConversation = { ...channel, type: 'group' }
      await setActiveConversation(channelConversation)
    }

    const clearActiveConversation = () => {
      activeConversation.value = null
    }

    const setActiveFriend = (friend) => {
      activeConversationPartner.value = {
        _id: friend._id,
        username: friend.username,
        avatar: friend.avatar
      }
    }

    const setReplyingTo = (message) => {
      replyingToMessage.value = message
    }

    const clearReplyingTo = () => {
      replyingToMessage.value = null
    }

    const searchMessagesInConversation = async (
      conversationId,
      searchTerm,
      page = 1
    ) => {
      if (!conversationId) {
        console.warn('会话 ID 不能为空')
      }
      if (!searchTerm || searchTerm.trim() === '') {
        searchResults.value = []
        currentSearchPage.value = 1
        totalSearchPages.value = 1
        canLoadMoreSearchResults.value = false
        isSearchingMessages.value = false
        currentSearchTerm.value = ''
        return
      }

      isSearchingMessages.value = true
      currentSearchTerm.value = searchTerm // 更新搜索词

      try {
        const response = await searchMessage({
          conversationId,
          searchTerm,
          page
        })

        if (page === 1) {
          // 如果是第一页，替换所有结果
          searchResults.value = response.data.messages
        } else {
          // 如果是加载更多，追加结果
          searchResults.value.push(...response.data.messages)
        }

        currentSearchPage.value = response.data.currentPage
        totalSearchPages.value = response.data.totalPages
        canLoadMoreSearchResults.value =
          response.data.currentPage < response.data.totalPages
      } catch (error) {
        console.error('搜索消息失败:', error)
        searchResults.value = [] // 清空结果
        currentSearchPage.value = 1
        totalSearchPages.value = 1
        canLoadMoreSearchResults.value = false
      } finally {
        isSearchingMessages.value = false
      }
    }

    const loadMoreSearchResults = async (conversationId, searchTerm) => {
      if (!canLoadMoreSearchResults.value || isSearchingMessages.value) {
        return
      }
      await searchMessagesInConversation(
        conversationId,
        searchTerm,
        currentSearchPage.value + 1
      )
    }

    const clearSearchResults = () => {
      searchResults.value = []
      isSearchingMessages.value = false
      currentSearchPage.value = 1
      totalSearchPages.value = 1
      canLoadMoreSearchResults.value = false
      currentSearchTerm.value = ''
    }

    return {
      conversations,
      activeConversation,
      messages,
      isLoadingConversations,
      currentMessagePage,
      totalMessagePages,
      canLoadMoreMessages,
      isLoadingMessages,
      activeConversationPartner,
      replyingToMessage,
      searchResults,
      isSearchingMessages,
      currentSearchPage,
      totalSearchPages,
      canLoadMoreSearchResults,
      currentSearchTerm,
      handleNewRealTimeMessage,
      getConversations,
      getMessages,
      setActiveConversation,
      selectFriendToChat,
      selectGroupChannelToChat,
      clearActiveConversation,
      setActiveFriend,
      setReplyingTo,
      clearReplyingTo,
      searchMessagesInConversation,
      loadMoreSearchResults,
      clearSearchResults
    }
  },
  {
    persist: {
      paths: ['activeConversation']
    }
  }
)
