import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import {
  getMessagesForConversation,
  getUserConversations,
  markAsRead
} from '../../api/chat'
import { getOrCreateConversation } from '../../api/chat'

export const useChatStore = defineStore(
  'chat',
  () => {
    // 会话列表
    const conversations = ref([])
    // 打开的会话 Id
    const activeConversationId = ref(null)
    const messages = ref([])
    const userStore = useUserStore()
    const isLoadingConversations = ref(false)
    const currentMessagePage = ref(1)
    const totalMessagePages = ref(1)
    const canLoadMoreMessages = ref(false)
    const isLoadingMessages = ref(false)
    const messageLimitPerPage = ref(20)
    const activeConversationPartner = ref({
      _id: '',
      username: '我的好友',
      avatar: '/images/defaultUserAvatar.png'
    })

    const handleNewRealTimeMessage = (newMessage) => {
      console.log('正在处理新的实时消息：', newMessage)

      // 传进来的消息必须要是当前打开的会话
      if (newMessage.conversationId === activeConversationId.value) {
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

        // 判断当前消息是否属于当前打开的会话和是否为当前用户发送的，以决定是否需要增加未读消息计数
        if (
          newMessage.conversationId !== activeConversationId.value &&
          newMessage.sender._id !== userStore.userInfo.userId
        ) {
          updatedConversation.unreadCount =
            (updatedConversation.unreadCount || 0) + 1
        }

        // 移除新消息所在的会话然后把更新的对话放在数组最前面（消息列表按新 -> 旧顺序排列）
        // 这里减少了性能开销：从之前的根据 lastMessageAt 来排序整个数组改成删除新消息所在会话再添加
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
        console.log('用户未登录，请重新登录')
        conversations.value = []
        return
      }
      isLoadingConversations.value = true
      try {
        const response = await getUserConversations()
        // console.log(response.data)
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
        console.log(error)
        if (pageToLoad === 1) {
          messages.value = []
        }
      } finally {
        isLoadingMessages.value = false
      }
    }

    const setActiveConversation = async (conversationId) => {
      // 点击已激活会话不重复加载
      if (conversationId === activeConversationId.value || !conversationId) {
        return
      }
      if (conversationId) {
        activeConversationId.value = conversationId
        messages.value = []
        currentMessagePage.value = 1
        totalMessagePages.value = 1
        canLoadMoreMessages.value = false
        isLoadingMessages.value = true
      }
      // 清除未读数
      const convIndex = conversations.value.findIndex(
        (c) => c._id === conversationId
      )
      console.log(11111)
      if (convIndex !== -1 && conversations.value[convIndex].unreadCount > 0) {
        console.log(
          `${conversationId} 有 ${conversations.value[convIndex].unreadCount} 未读`
        )
        conversations.value[convIndex].unreadCount = 0 // 在前端UI上清除未读消息标志

        markAsRead(conversationId).catch((err) => {
          console.error('在后台标记已读失败:', err)
        })
      }

      try {
        await getMessages(conversationId, 1)
      } catch (error) {
        console.error(error)
      } finally {
        isLoadingMessages.value = false
      }
    }

    const setActiveFriend = async (friend) => {
      if (!friend || !friend._id) {
        return
      }

      if (
        activeConversationPartner.value &&
        activeConversationPartner.value._id === friend._id
      ) {
        return
      }

      try {
        const response = await getOrCreateConversation(friend._id)
        const { _id: conversationId } = response.data

        activeConversationId.value = conversationId
        activeConversationPartner.value = {
          _id: friend._id,
          username: friend.username,
          avatar: friend.avatar
        }
        messages.value = []
        currentMessagePage.value = 1
        totalMessagePages.value = 1
        canLoadMoreMessages.value = false

        const convIndex = conversations.value.findIndex(
          (c) => c._id === conversationId
        )

        if (
          convIndex !== -1 &&
          conversations.value[convIndex].unreadCount > 0
        ) {
          conversations.value[convIndex].unreadCount = 0
          try {
            const response = await markAsRead(conversationId)
            console.log(response)
          } catch (error) {
            console.error('后台标记已读失败:', error)
          }
        }

        // 加载该会话的第一页消息
        await getMessages(conversationId, 1)
      } catch (error) {
        console.error(error)
      }
    }

    return {
      conversations,
      activeConversationId,
      messages,
      isLoadingConversations,
      currentMessagePage,
      totalMessagePages,
      canLoadMoreMessages,
      isLoadingMessages,
      activeConversationPartner,
      handleNewRealTimeMessage,
      getConversations,
      getMessages,
      setActiveConversation,
      setActiveFriend
    }
  },
  {
    persist: {
      paths: ['activeConversationId']
    }
  }
)
