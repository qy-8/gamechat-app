<script setup>
import MessageItem from '@/components/MessageItem.vue'
import { useChatStore, useUserStore } from '@/stores'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const userStore = useUserStore()

const {
  searchResults,
  isSearchingMessages,
  currentSearchTerm,
  canLoadMoreSearchResults
} = storeToRefs(chatStore)
const { loadMoreSearchResults, clearSearchResults } = chatStore

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
  min-width: 300px;
  max-width: 450px;
  max-height: 400px;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.loading-state,
.no-results-state {
  text-align: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-tip,
.no-more-results-tip {
  text-align: center;
  padding: 10px 0;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.search-result-item {
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
