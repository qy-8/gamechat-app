/**
 * @file stores/modules/chatStore.js
 * @description Pinia Store，用于管理聊天会话、消息、实时通信事件和消息搜索功能。
 * 它是聊天功能的核心状态管理模块。
 * @module ChatStore
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import {
  getMessagesForConversation,
  getUserConversations,
  markAsRead,
  searchMessage,
  getOrCreateConversation
} from '../../api/chat'
import emitter from '../../services/eventBus' // 导入事件总线

/**
 * @function useChatStore
 * @description Pinia Store，用于管理聊天相关的所有状态和操作。
 * 包含会话列表、消息列表、活跃会话、加载状态、消息回复以及消息搜索功能。
 * @returns {{
 * conversations: Ref<Array<object>>,
 * messages: Ref<Array<object>>,
 * activeConversation: Ref<object|null>,
 * isLoadingConversations: Ref<boolean>,
 * currentMessagePage: Ref<number>,
 * totalMessagePages: Ref<number>,
 * canLoadMoreMessages: Ref<boolean>,
 * isLoadingMessages: Ref<boolean>,
 * messageLimitPerPage: Ref<number>,
 * replyingToMessage: Ref<object|null>,
 * searchResults: Ref<Array<object>>,
 * isSearchingMessages: Ref<boolean>,
 * currentSearchPage: Ref<number>,
 * totalSearchPages: Ref<number>,
 * canLoadMoreSearchResults: Ref<boolean>,
 * currentSearchTerm: Ref<string>,
 * activeConversationPartner: Ref<object>,
 * handleNewRealTimeMessage: Function,
 * getConversations: Function,
 * getMessages: Function,
 * setActiveConversation: Function,
 * selectFriendToChat: Function,
 * selectGroupChannelToChat: Function,
 * clearActiveConversation: Function,
 * setActiveFriend: Function,
 * setReplyingTo: Function,
 * clearReplyingTo: Function,
 * searchMessagesInConversation: Function,
 * loadMoreSearchResults: Function,
 * clearSearchResults: Function
 * }}
 * @property {Ref<Array<object>>} conversations - 用户的所有会话列表。
 * @property {Ref<Array<object>>} messages - 当前活跃会话的消息列表。
 * @property {Ref<object|null>} activeConversation - 当前活跃的会话对象。
 * @property {Ref<boolean>} isLoadingConversations - 会话列表是否正在加载中。
 * @property {Ref<number>} currentMessagePage - 当前消息列表已加载的页码。
 * @property {Ref<number>} totalMessagePages - 当前活跃会话的总消息页数。
 * @property {Ref<boolean>} canLoadMoreMessages - 是否可以加载更多消息。
 * @property {Ref<boolean>} isLoadingMessages - 消息列表是否正在加载中。
 * @property {Ref<number>} messageLimitPerPage - 每页加载的消息数量限制。
 * @property {Ref<object|null>} replyingToMessage - 当前正在回复的消息对象。
 * @property {Ref<Array<object>>} searchResults - 消息搜索结果列表。
 * @property {Ref<boolean>} isSearchingMessages - 消息是否正在搜索中。
 * @property {Ref<number>} currentSearchPage - 当前搜索结果已加载的页码。
 * @property {Ref<number>} totalSearchPages - 搜索结果的总页数。
 * @property {Ref<boolean>} canLoadMoreSearchResults - 是否可以加载更多搜索结果。
 * @property {Ref<string>} currentSearchTerm - 当前的搜索关键词。
 * @property {Ref<object>} activeConversationPartner - 当前活跃私聊会话的伙伴用户信息。
 * @property {Function} handleNewRealTimeMessage - 处理实时接收到的新消息。
 * @property {Function} getConversations - 获取用户所有会话列表。
 * @property {Function} getMessages - 获取指定会话的消息列表。
 * @property {Function} setActiveConversation - 设置当前活跃的会话。
 * @property {Function} selectFriendToChat - 通过好友信息选择并激活聊天会话。
 * @property {Function} selectGroupChannelToChat - 通过群组频道信息选择并激活聊天会话。
 * @property {Function} clearActiveConversation - 清除当前活跃会话状态。
 * @property {Function} setActiveFriend - 设置活跃会话伙伴（用于私聊）。
 * @property {Function} setReplyingTo - 设置要回复的消息。
 * @property {Function} clearReplyingTo - 清除回复消息状态。
 * @property {Function} searchMessagesInConversation - 在指定会话中搜索消息。
 * @property {Function} loadMoreSearchResults - 加载更多消息搜索结果。
 * @property {Function} clearSearchResults - 清空消息搜索结果。
 */
export const useChatStore = defineStore(
  'chat',
  () => {
    /** @type {Ref<Array<object>>} */
    const conversations = ref([]) // 用户的所有会话列表
    /** @type {Ref<Array<object>>} */
    const messages = ref([]) // 当前活跃会话的消息列表
    /** @type {Ref<object|null>} */
    const activeConversation = ref(null) // 当前活跃的会话对象
    const userStore = useUserStore()
    /** @type {Ref<boolean>} */
    const isLoadingConversations = ref(false) // 会话列表是否正在加载中
    /** @type {Ref<number>} */
    const currentMessagePage = ref(1) // 当前消息列表已加载的页码
    /** @type {Ref<number>} */
    const totalMessagePages = ref(1) // 当前活跃会话的总消息页数
    /** @type {Ref<boolean>} */
    const canLoadMoreMessages = ref(false) // 是否可以加载更多消息
    /** @type {Ref<boolean>} */
    const isLoadingMessages = ref(false) // 消息列表是否正在加载中
    /** @type {Ref<number>} */
    const messageLimitPerPage = ref(20) // 每页加载的消息数量限制
    /** @type {Ref<object|null>} */
    const replyingToMessage = ref(null) // 当前正在回复的消息内容

    // 消息搜索相关状态
    /** @type {Ref<Array<object>>} */
    const searchResults = ref([]) // 消息搜索结果列表
    /** @type {Ref<boolean>} */
    const isSearchingMessages = ref(false) // 消息是否正在搜索中
    /** @type {Ref<number>} */
    const currentSearchPage = ref(1) // 当前搜索结果已加载的页码
    /** @type {Ref<number>} */
    const totalSearchPages = ref(1) // 搜索结果的总页数
    /** @type {Ref<boolean>} */
    const canLoadMoreSearchResults = ref(false) // 是否可以加载更多搜索结果
    /** @type {Ref<string>} */
    const currentSearchTerm = ref('') // 当前的搜索关键词

    /**
     * @type {Ref<object>}
     * @description 当前活跃私聊会话的伙伴用户信息。
     */
    const activeConversationPartner = ref({
      _id: '',
      username: '你的好友',
      avatar: '/images/defaultUserAvatar.png'
    })

    /**
     * @function handleNewRealTimeMessage
     * @description 处理实时接收到的新消息。
     * 更新当前会话的消息列表，并更新会话列表中的最新消息和未读计数，同时触发桌面通知。
     * @param {object} newMessage - 新消息数据对象。
     * @param {string} newMessage.conversationId - 消息所属会话的 ID。
     * @param {string} newMessage.content - 消息内容。
     * @param {string} newMessage.messageType - 消息类型（如 'text', 'image'）。
     * @param {string} newMessage.sender._id - 消息发送者的用户 ID。
     * @param {string} newMessage.sender.username - 消息发送者的用户名。
     * @param {string} newMessage.conversationType - 会话类型（'private' 或 'group'）。
     * @param {object} [newMessage.groupInfo] - 如果是群组消息，包含群组信息。
     * @returns {void}
     */
    const handleNewRealTimeMessage = (newMessage) => {
      // 传进来的消息必须要是当前打开的会话
      if (newMessage.conversationId === activeConversation.value?._id) {
        // 检测是否有一样 id 的信息，防止重复添加
        const exists = messages.value.some((m) => m._id === newMessage._id)
        if (!exists) {
          messages.value.push(newMessage)
        }
      }

      // 更新会话列表中的对应会话
      const conversationIndex = conversations.value.findIndex(
        (c) => c._id === newMessage.conversationId
      )

      if (conversationIndex !== -1) {
        // 拿到新消息所在的 conversation 的副本
        const updatedConversation = {
          ...conversations.value[conversationIndex]
        }

        updatedConversation.lastMessage = newMessage // 更新最后一条消息
        // 更新最后一条消息的片段，避免过长
        updatedConversation.lastMessageContentSnippet =
          newMessage.content.length > 30
            ? newMessage.content.substring(0, 27) + '...'
            : newMessage.content
        updatedConversation.lastMessageAt = newMessage.createdAt // 更新最后消息时间

        let notificationTitle = ''
        let notificationMessage = ''

        // 根据会话类型（私聊或群聊）构造通知标题
        if (newMessage.conversationType === 'group') {
          notificationTitle = `群组 [${newMessage.groupInfo?.name}] 有新消息，来自 ${newMessage.sender.username}`
        } else {
          notificationTitle = `有来自 ${newMessage.sender.username} 的新消息`
        }

        // 根据消息类型（图片或文本）构造通知内容
        if (newMessage.messageType === 'image') {
          notificationMessage = '[图片]'
        } else {
          notificationMessage = newMessage.content
        }

        // 判断是否需要增加未读消息计数和发送桌面通知
        // 条件：消息不属于当前打开的会话 且 消息不是当前用户自己发送的
        if (
          newMessage.conversationId !== activeConversation.value?._id &&
          newMessage.sender._id !== userStore.userInfo.userId
        ) {
          updatedConversation.unreadCount =
            (updatedConversation.unreadCount || 0) + 1 // 未读数加1
          // 如果会话未被静音，则发送通知
          if (!userStore.isMuted(newMessage.conversationId)) {
            emitter.emit('show-notification', {
              title: notificationTitle,
              message: notificationMessage
            })
          }
        }

        // 移除旧的会话条目，并将更新后的会话放在列表最前面（实现“最新消息置顶”效果）
        conversations.value.splice(conversationIndex, 1)
        conversations.value.unshift(updatedConversation)
      } else {
        console.warn(
          `收到新消息，但会话 ${newMessage.conversationId} 不在当前会话列表内。`
        )
      }
    }

    /**
     * @function getConversations
     * @description 获取当前用户的所有会话列表。
     * 在用户未登录时，清空会话列表。
     * @returns {Promise<void>}
     * @throws {Error} 如果获取会话列表失败，会打印错误信息。
     */
    const getConversations = async () => {
      if (!userStore.isLoggedIn) {
        conversations.value = [] // 未登录清空会话
        return
      }
      isLoadingConversations.value = true // 设置加载状态
      try {
        const response = await getUserConversations() // 调用 API 获取会话
        conversations.value = response.data // 更新会话列表
      } catch (error) {
        console.error('获取会话列表失败：', error)
      } finally {
        isLoadingConversations.value = false // 结束加载状态
      }
    }

    /**
     * @function getMessages
     * @description 获取指定会话的消息列表。
     * 支持分页加载，新消息会追加到现有列表。
     * @param {string} conversationId - 要获取消息的会话 ID。
     * @param {number} [pageToLoad=1] - 要加载的页码。
     * @returns {Promise<void>}
     * @throws {Error} 如果获取消息失败，会打印错误信息并清空消息列表。
     */
    const getMessages = async (conversationId, pageToLoad = 1) => {
      if (!conversationId) {
        console.warn('getMessages: conversationId 为空')
        isLoadingMessages.value = false
        return
      }
      isLoadingMessages.value = true // 设置消息加载状态
      try {
        const response = await getMessagesForConversation(
          // 调用 API 获取消息
          conversationId,
          pageToLoad,
          messageLimitPerPage.value
        )
        if (pageToLoad === 1) {
          messages.value = response.data.messages // 如果是第一页，替换所有消息
        } else {
          // 如果是加载更多页，将新消息添加到现有消息列表的开头
          messages.value = [...response.data.messages, ...messages.value]
        }
        currentMessagePage.value = response.data.currentPage // 更新当前页码
        totalMessagePages.value = response.data.totalPages // 更新总页数
        // 判断是否还有更多消息可加载
        canLoadMoreMessages.value =
          response.data.currentPage < response.data.totalPages
      } catch (error) {
        console.error('获取消息失败：', error)
        if (pageToLoad === 1) {
          messages.value = [] // 第一页加载失败时清空消息列表
        }
      } finally {
        isLoadingMessages.value = false // 结束消息加载状态
      }
    }

    /**
     * @function setActiveConversation
     * @description 设置当前活跃的会话，并加载其消息列表。
     * 如果会话有未读消息，会标记为已读。
     * @param {object} conversation - 要激活的会话对象。
     * @returns {Promise<void>}
     */
    const setActiveConversation = async (conversation) => {
      // 如果点击的是已经激活的会话，或者会话对象为空，则不重复加载
      if (conversation._id === activeConversation.value?._id || !conversation) {
        return
      }

      if (conversation._id) {
        activeConversation.value = conversation // 设置活跃会话
        messages.value = [] // 清空旧消息
        currentMessagePage.value = 1 // 重置分页
        totalMessagePages.value = 1
        canLoadMoreMessages.value = false
        isLoadingMessages.value = true // 设置加载状态
      }

      // 清除会话的未读数（前端UI更新）
      const convInList = conversations.value.find(
        (c) => c._id === conversation._id
      )
      if (convInList && convInList.unreadCount > 0) {
        convInList.unreadCount = 0 // 在前端UI上清除未读消息标志
        // 调用 API 标记消息为已读
        markAsRead(conversation._id).catch((err) => {
          console.error('标记已读失败：', err)
        })
      }

      try {
        await getMessages(conversation._id, 1) // 获取新会话的第一页消息
      } catch (error) {
        console.error('激活会话并加载消息失败：', error)
      } finally {
        isLoadingMessages.value = false // 结束加载状态
      }
    }

    /**
     * @function selectFriendToChat
     * @description 通过好友信息选择一个私聊会话。
     * 如果会话不存在，则创建新的会话。
     * @param {object} friend - 好友对象，包含 _id, username, avatar 等。
     * @returns {Promise<void>}
     */
    const selectFriendToChat = async (friend) => {
      if (!friend || !friend._id) {
        console.warn('selectFriendToChat: 好友信息不完整')
        return
      }

      // 如果当前已经与该好友处于活跃会话，则不重复操作
      if (activeConversation.value?.targetParticipant?._id === friend._id) {
        return
      }

      try {
        // 获取或创建与该好友的私聊会话
        const response = await getOrCreateConversation(friend._id)
        const newConversation = response.data

        // 如果新会话不在当前会话列表中，则添加到最前面
        const existInList = conversations.value.some(
          (c) => c._id === newConversation._id
        )
        if (!existInList) {
          conversations.value.unshift(newConversation)
        }
        await setActiveConversation(newConversation) // 激活该会话
      } catch (error) {
        console.error('选择好友聊天失败：', error)
      }
    }

    /**
     * @function selectGroupChannelToChat
     * @description 通过群组频道信息选择一个群组会话。
     * @param {object} channel - 群组频道对象，包含 _id, name 等信息。
     * @returns {Promise<void>}
     */
    const selectGroupChannelToChat = async (channel) => {
      if (!channel || !channel._id) {
        console.warn('selectGroupChannelToChat: 频道信息不完整')
        return
      }
      // 如果当前已经与该频道处于活跃会话，则不重复操作
      if (activeConversation.value?._id === channel._id) {
        return
      }
      // 构造一个会话对象并激活
      const channelConversation = { ...channel, type: 'group' }
      await setActiveConversation(channelConversation)
    }

    /**
     * @function clearActiveConversation
     * @description 清除当前活跃会话的状态。
     * @returns {void}
     */
    const clearActiveConversation = () => {
      activeConversation.value = null
    }

    /**
     * @function setActiveFriend
     * @description 设置活跃会话的伙伴信息（主要用于私聊显示）。
     * @param {object} friend - 好友对象。
     * @returns {void}
     */
    const setActiveFriend = (friend) => {
      activeConversationPartner.value = {
        _id: friend._id,
        username: friend.username,
        avatar: friend.avatar
      }
    }

    /**
     * @function setReplyingTo
     * @description 设置要回复的消息内容。
     * @param {object} message - 要回复的消息对象。
     * @returns {void}
     */
    const setReplyingTo = (message) => {
      replyingToMessage.value = message
    }

    /**
     * @function clearReplyingTo
     * @description 清除当前回复的消息状态。
     * @returns {void}
     */
    const clearReplyingTo = () => {
      replyingToMessage.value = null
    }

    /**
     * @function searchMessagesInConversation
     * @description 在指定会话中搜索消息。
     * 支持分页和加载更多搜索结果。
     * @param {string} conversationId - 要搜索的会话 ID。
     * @param {string} searchTerm - 搜索关键词。
     * @param {number} [page=1] - 要加载的搜索结果页码。
     * @returns {Promise<void>}
     */
    const searchMessagesInConversation = async (
      conversationId,
      searchTerm,
      page = 1
    ) => {
      if (!conversationId) {
        console.warn('searchMessagesInConversation: 会话 ID 不能为空')
        // return; // 根据实际需求决定是否中断
      }
      // 如果搜索词为空或只有空格，清空搜索结果并重置状态
      if (!searchTerm || searchTerm.trim() === '') {
        searchResults.value = []
        currentSearchPage.value = 1
        totalSearchPages.value = 1
        canLoadMoreSearchResults.value = false
        isSearchingMessages.value = false
        currentSearchTerm.value = ''
        return
      }

      isSearchingMessages.value = true // 设置搜索中状态
      currentSearchTerm.value = searchTerm // 更新当前搜索词

      try {
        const response = await searchMessage({
          conversationId,
          searchTerm,
          page
        })

        if (page === 1) {
          searchResults.value = response.data.messages // 第一页，替换所有结果
        } else {
          searchResults.value.push(...response.data.messages) // 加载更多，追加结果
        }

        currentSearchPage.value = response.data.currentPage // 更新当前搜索页码
        totalSearchPages.value = response.data.totalPages // 更新搜索结果总页数
        // 判断是否可以加载更多搜索结果
        canLoadMoreSearchResults.value =
          response.data.currentPage < response.data.totalPages
      } catch (error) {
        console.error('搜索消息失败：', error)
        // 搜索失败时清空结果并重置分页状态
        searchResults.value = []
        currentSearchPage.value = 1
        totalSearchPages.value = 1
        canLoadMoreSearchResults.value = false
      } finally {
        isSearchingMessages.value = false // 结束搜索中状态
      }
    }

    /**
     * @function loadMoreSearchResults
     * @description 加载更多消息搜索结果。
     * 仅在还有更多结果且当前未在搜索中时触发。
     * @param {string} conversationId - 当前活跃会话 ID。
     * @param {string} searchTerm - 当前搜索关键词。
     * @returns {Promise<void>}
     */
    const loadMoreSearchResults = async (conversationId, searchTerm) => {
      // 如果没有更多结果可加载或者当前正在搜索中，则返回
      if (!canLoadMoreSearchResults.value || isSearchingMessages.value) {
        return
      }
      await searchMessagesInConversation(
        conversationId,
        searchTerm,
        currentSearchPage.value + 1 // 加载下一页
      )
    }

    /**
     * @function clearSearchResults
     * @description 清空所有消息搜索结果并重置搜索状态。
     * @returns {void}
     */
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
    // Pinia 持久化配置
    persist: {
      paths: ['activeConversation']
    }
  }
)
