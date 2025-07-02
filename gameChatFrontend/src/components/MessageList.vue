<script setup>
import MessageItem from '@/components/MessageItem.vue'
import { useChatStore, useUserStore } from '@/stores'
import { ref, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'

const chatStore = useChatStore()
const userStore = useUserStore()

const {
  messages,
  activeConversation,
  isLoadingMessages,
  canLoadMoreMessages,
  currentMessagePage
} = storeToRefs(chatStore)
const isSwitchingConversation = ref(false)
const scrollbarRef = ref(null)
const isLoadingMore = ref(false)

const scrollToBottom = async (behavior = 'auto') => {
  await nextTick()

  if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
    const scrollWrapper = scrollbarRef.value.wrapRef
    await new Promise((resolve) => setTimeout(resolve, 50))
    scrollWrapper.scrollTo({
      top: scrollWrapper.scrollHeight,
      behavior: behavior
    })
  }
}

// 处理滚动事件
const loadMore = async () => {
  // 条件：不能加载更多 || store 正在加载 || 本地正在加载
  if (
    !canLoadMoreMessages.value ||
    isLoadingMessages.value ||
    isLoadingMore.value
  ) {
    return
  }
  isLoadingMore.value = true
  const scrollWrapper = scrollbarRef.value?.wrapRef
  const oldScrollHeight = scrollWrapper ? scrollWrapper.scrollHeight : 0

  try {
    await chatStore.getMessages(
      activeConversation.value._id,
      currentMessagePage.value + 1
    )
    await nextTick()
    if (scrollWrapper) {
      scrollWrapper.scrollTop = scrollWrapper.scrollHeight - oldScrollHeight
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingMore.value = false
  }
}

const debouncedLoadMore = debounce(loadMore, 200)

const handleScroll = ({ scrollTop }) => {
  if (isSwitchingConversation.value) {
    return
  }
  if (scrollTop < 300) {
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
        await chatStore.getMessages(newConversation._id, 1)

        await scrollToBottom('auto')
      } catch (err) {
        console.error(`加载会话 ${newConversation._id} 的消息失败:`, err)
      } finally {
        // 解锁
        isSwitchingConversation.value = false
      }
    }
  },
  { immediate: true }
)

// 滚动判断：新消息加入（用户发送/接收新消息）
watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    // if (oldLength > 0 && newLength > oldLength) {
    if (newLength === oldLength + 1) {
      scrollToBottom('smooth')
    }
  },
  { flush: 'post' } // flush: 'post' 确保 DOM 更新后再执行
)

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
.messages-list-container {
  height: 100%;
  overflow: hidden;
}
</style>
