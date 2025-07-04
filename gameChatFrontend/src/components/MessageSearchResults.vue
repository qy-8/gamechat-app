<script setup>
/**
 * @file MessageSearchResults.vue
 * @description 显示聊天消息搜索结果的组件，支持无限滚动加载更多结果。
 * @component MessageSearchResults
 */
import MessageItem from '@/components/MessageItem.vue'
import { useChatStore } from '@/stores'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()

const {
  searchResults,
  isSearchingMessages,
  currentSearchTerm,
  canLoadMoreSearchResults
} = storeToRefs(chatStore)
const { loadMoreSearchResults, clearSearchResults } = chatStore

/**
 * 处理加载更多。
 * 仅在有活跃会话 ID 和搜索词时触发加载。
 */
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
/*------------------------------------*\
 # 消息搜索结果容器
 # 描述：定义搜索结果容器的最小/最大宽度、最大高度、内边距和溢出处理。
\*------------------------------------*/
.message-search-results-container {
  min-width: 300px;
  max-width: 450px;
  max-height: 400px;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

/*------------------------------------*\
 # 加载和无结果状态
 # 描述：定义搜索中和无结果时显示状态的通用样式，包括文本对齐、内边距和颜色。
\*------------------------------------*/
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

/*------------------------------------*\
 # 加载提示和无更多结果提示
 # 描述：定义加载提示和“没有更多结果”提示文本的样式。
\*------------------------------------*/
.loading-tip,
.no-more-results-tip {
  text-align: center;
  padding: 10px 0;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

/*------------------------------------*\
 # 搜索结果项样式
 # 描述：定义单个搜索结果消息项的鼠标样式、内边距和底部边框。
\*------------------------------------*/
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
