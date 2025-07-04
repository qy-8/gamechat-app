<script setup>
/**
 * @file MessageList.vue
 * @description 聊天消息列表组件，负责显示消息、管理滚动加载和新消息滚动到底部。
 * @component MessageList
 */
import MessageItem from '@/components/MessageItem.vue'
import { useChatStore, useUserStore } from '@/stores'
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'

const chatStore = useChatStore()

const {
  messages,
  activeConversation,
  isLoadingMessages,
  canLoadMoreMessages,
  currentMessagePage
} = storeToRefs(chatStore)
// 会话切换状态，用于防止滚动加载在新会话加载时触发
const isSwitchingConversation = ref(false)
// 滚动条组件引用
const scrollbarRef = ref(null)
// 标记是否正在加载更多消息（本地状态）
const isLoadingMore = ref(false)

/**
 * 滚动消息列表到底部。
 * @param {ScrollBehavior} [behavior='auto'] - 滚动行为 ('auto' 或 'smooth')。
 */
const scrollToBottom = async (behavior = 'auto') => {
  await nextTick() // 确保 DOM 已更新

  if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
    const scrollWrapper = scrollbarRef.value.wrapRef
    // 稍作延迟，确保内容完全渲染
    await new Promise((resolve) => setTimeout(resolve, 50))
    scrollWrapper.scrollTo({
      top: scrollWrapper.scrollHeight, // 滚动到最底部
      behavior: behavior
    })
  }
}

/**
 * 处理向上滚动加载更多消息。
 * 当用户滚动到接近顶部时，触发加载下一页消息。
 */
const loadMore = async () => {
  // 检查是否满足加载更多条件
  if (
    !canLoadMoreMessages.value || // 没有更多消息可加载
    isLoadingMessages.value || // Store 正在加载消息
    isLoadingMore.value // 本地正在加载更多消息
  ) {
    return
  }
  isLoadingMore.value = true // 设置本地加载状态
  const scrollWrapper = scrollbarRef.value?.wrapRef
  // 记录加载前的高度
  const oldScrollHeight = scrollWrapper ? scrollWrapper.scrollHeight : 0

  try {
    // 获取下一页消息
    await chatStore.getMessages(
      activeConversation.value._id,
      currentMessagePage.value + 1
    )
    await nextTick() // 等待 DOM 更新
    // 调整滚动位置
    if (scrollWrapper) {
      scrollWrapper.scrollTop = scrollWrapper.scrollHeight - oldScrollHeight
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
  } finally {
    isLoadingMore.value = false // 结束本地加载状态
  }
}

// 对 loadMore 函数进行防抖处理，避免频繁触发
const debouncedLoadMore = debounce(loadMore, 200)

/**
 * 处理滚动条的滚动事件。
 * 当滚动位置接近顶部时，触发防抖加载更多消息。
 * @param {object} { scrollTop } - 滚动条的当前滚动位置。
 */
const handleScroll = ({ scrollTop }) => {
  if (isSwitchingConversation.value) {
    return
  }
  if (scrollTop < 300) {
    // 当滚动到顶部300px内时触发加载
    debouncedLoadMore()
  }
}

// 滚动判断：当用户切换会话，滚动到底部
watch(
  activeConversation,
  async (newConversation, oldConversation) => {
    if (newConversation && newConversation._id !== oldConversation?._id) {
      isSwitchingConversation.value = true
      try {
        // 加载新会话的第一页消息
        await chatStore.getMessages(newConversation._id, 1)
        await scrollToBottom('auto') // 滚动到底部
      } catch (err) {
        console.error(`加载会话 ${newConversation._id} 的消息失败:`, err)
      } finally {
        isSwitchingConversation.value = false // 解锁切换状态
      }
    }
  },
  { immediate: true }
)

// 滚动判断：新消息加入（用户发送/接收新消息）
watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    // 仅当消息数量增加1（表示收到或发送了一条新消息）时平滑滚动
    if (newLength === oldLength + 1) {
      scrollToBottom('smooth')
    }
  },
  { flush: 'post' } // 'post' 确保在 DOM 更新后执行回调
)

// 组件卸载时取消任何待执行的防抖函数
onUnmounted(() => {
  debouncedLoadMore.cancel()
})
</script>

<template>
  <div class="messages-list-container">
    <el-scrollbar ref="scrollbarRef" @scroll="handleScroll">
      <MessageItem v-for="item in messages" :key="item._id" :message="item" />
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 消息列表容器
 # 描述：定义消息列表容器的高度，并隐藏溢出内容，使其可滚动。
\*------------------------------------*/
.messages-list-container {
  height: 100%;
  overflow: hidden;
}
</style>
