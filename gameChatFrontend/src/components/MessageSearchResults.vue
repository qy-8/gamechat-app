<script setup>
import MessageItem from '@/components/MessageItem.vue' // 导入消息项组件
import { useChatStore, useUserStore } from '@/stores' // 导入 Pinia store
import { storeToRefs } from 'pinia' // 导入 storeToRefs 以保持响应性
import { computed } from 'vue' // 确保导入 computed 和 ref

const chatStore = useChatStore()
const userStore = useUserStore()

// 从 chatStore 中解构搜索相关的响应式状态和 action
const {
  searchResults,
  isSearchingMessages,
  currentSearchTerm,
  canLoadMoreSearchResults
} = storeToRefs(chatStore)
const { loadMoreSearchResults, clearSearchResults } = chatStore // action 直接解构

// 定义加载更多的函数，用于 el-scrollbar 的 v-infinite-scroll
const handleLoadMore = () => {
  // 只有在有活跃会话 ID 且有搜索词时才加载更多搜索结果
  if (chatStore.activeConversation?._id && currentSearchTerm.value) {
    loadMoreSearchResults(
      chatStore.activeConversation._id,
      currentSearchTerm.value
    )
  }
}

// 点击搜索结果项的逻辑 (可选功能：用于跳转到消息上下文)
// 这里可以添加逻辑，点击后关闭 Popover，并跳转到主聊天界面的特定消息位置
const handleClickSearchResult = (messageId, conversationId) => {
  console.log(`点击了搜索结果消息: ${messageId}，会话ID: ${conversationId}`)
  // TODO: 如果需要，在这里实现点击搜索结果后跳转到聊天界面并滚动到该消息的功能
  // 这会涉及切换 chatStore.activeConversation，然后 MessageList 加载以该消息为中心的页面，并滚动
  // 可能需要 emit 一个事件给父组件 (ConversationHeader) 来关闭 Popover
  // emit('close-popover');
}
</script>

<template>
  <div class="message-search-results-container">
    <div
      v-if="isSearchingMessages && searchResults.length === 0"
      class="loading-state"
    >
      <el-icon class="is-loading"><Loading /></el-icon> 正在搜索...
    </div>
    <el-scrollbar
      v-else-if="searchResults.length > 0"
      height="300px"
      v-infinite-scroll="handleLoadMore"
      :infinite-scroll-disabled="
        !canLoadMoreSearchResults || isSearchingMessages
      "
      :infinite-scroll-distance="50"
    >
      <MessageItem
        v-for="item in searchResults"
        :key="item._id"
        :message="item"
        @click="handleClickSearchResult(item._id, item.conversationId)"
        class="search-result-item"
      />
      <p
        v-if="canLoadMoreSearchResults && isSearchingMessages"
        class="loading-tip"
      >
        加载中...
      </p>
      <p
        v-if="!canLoadMoreSearchResults && searchResults.length > 0"
        class="no-more-results-tip"
      >
        没有更多结果了
      </p>
    </el-scrollbar>
    <div v-else class="no-results-state">
      <el-empty description="没有找到相关消息" :image-size="80" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-search-results-container {
  min-width: 300px; /* 搜索结果浮层的最小宽度 */
  max-width: 450px; /* 搜索结果浮层的最大宽度 */
  max-height: 400px; /* 搜索结果浮层的最大高度 */
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden; /* 确保内容在容器内 */
}

.loading-state,
.no-results-state {
  text-align: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
  display: flex; /* 使用 flex 布局 */
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  height: 100%; /* 确保占据父容器高度 */
}

.loading-tip,
.no-more-results-tip {
  text-align: center;
  padding: 10px 0;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

/* 单个搜索结果项的样式 */
.search-result-item {
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter); /* 结果项之间有分隔线 */

  &:last-child {
    border-bottom: none; /* 最后一个项没有分隔线 */
  }
  &:hover {
    background-color: var(--el-color-primary-light-9); /* 鼠标悬停时的背景色 */
  }
}
</style>
