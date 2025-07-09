<script setup>
/**
 * @file ChatContent.vue
 * @description 聊天内容区域的主组件，包含聊天头部、消息列表、消息输入框。
 * @component ChatContent
 */
import { ref, onMounted, computed } from 'vue'
import ConversationHeader from './ConversationHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import SearchInput from './common/SearchInput.vue'
import { sendGroupInvitation, searchGroupMembers } from '../api/group'
import { useGroupStore, useFriendStore } from '../stores'
import UserBadge from './common/UserBadge.vue'
import { storeToRefs } from 'pinia'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 控制成员抽屉的显示
const memberDrawerVisible = ref(false)
const loading = ref(false)
const groupStore = useGroupStore()
const friendStore = useFriendStore()
const { groupMembers } = storeToRefs(groupStore)
const { friendList } = storeToRefs(friendStore)
const selectedFriendIds = ref([])
const isSearching = ref(false)
const searchResults = ref([])
const currentSearchTerm = ref('')
const currentSearchPage = ref(1)
const totalSearchPages = ref(1)
const isLoadingMore = ref(false)

// 组件挂载时获取好友列表
onMounted(() => {
  friendStore.getList()
})

// 获取群组成员列表
const fetchMembers = async () => {
  loading.value = true
  isSearching.value = false
  searchResults.value = []
  currentSearchTerm.value = ''
  groupStore.fetchGroupMembers()
  loading.value = false
}

// 切换好友选择状态（用于邀请）
const toggleSelection = (friendId) => {
  const index = selectedFriendIds.value.indexOf(friendId)
  if (index > -1) {
    selectedFriendIds.value.splice(index, 1)
  } else {
    selectedFriendIds.value.push(friendId)
  }
}

// 发送群组邀请
const handleSendInvitations = async () => {
  if (selectedFriendIds.value.length === 0) return
  const groupId = groupStore.activeGroupId
  try {
    await sendGroupInvitation({
      groupId,
      inviteeIds: selectedFriendIds.value
    })
    ElMessage.success('邀请已发送')
  } catch (error) {
    console.error(error)
  } finally {
    selectedFriendIds.value = []
  }
}

// 处理群成员搜索
const handleSearch = async (searchTerm) => {
  if (!searchTerm) {
    searchResults.value = []
    return
  }
  currentSearchTerm.value = searchTerm
  isSearching.value = true
  loading.value = true
  try {
    currentSearchPage.value = 1
    const response = await searchGroupMembers({
      groupId: groupStore.activeGroupId,
      q: searchTerm,
      page: 1,
      limit: 20
    })
    searchResults.value = response.data.members
    totalSearchPages.value = response.data.totalPages
  } catch (error) {
    console.error(error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 加载更多群成员（用于滚动加载）
const loadMoreMembers = async () => {
  const canLoad = currentSearchPage.value < totalSearchPages.value

  if (!canLoad || isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true
  try {
    const nextPage = currentSearchPage.value + 1
    const response = await searchGroupMembers({
      groupId: groupStore.activeGroupId,
      q: currentSearchTerm.value,
      page: nextPage
    })
    searchResults.value.push(...response.data.members)
    currentSearchPage.value = response.data.currentPage
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingMore.value = false
  }
}

// 根据搜索状态显示群成员或搜索结果
const displayedMembers = computed(() => {
  return isSearching.value ? searchResults.value : groupMembers.value
})

// 判断是否可以加载更多成员
const canLoadMore = computed(() => {
  return isSearching.value && currentSearchPage.value < totalSearchPages.value
})

// 处理踢出群成员
const handleKickMember = async (memberId) => {
  groupStore.handleKickGroupMember(memberId)
}
</script>

<template>
  <div class="container">
    <!-- 聊天页面头部 -->
    <ConversationHeader
      class="conversation-header"
      @open-member-drawer="memberDrawerVisible = true"
    />
    <!-- 聊天页面消息列表 -->
    <MessageList class="message-container" />

    <!-- 聊天页面输入框 -->
    <MessageInput class="input-container" />

    <!-- 成员显示抽屉 -->
    <el-drawer
      v-model="memberDrawerVisible"
      direction="rtl"
      size="300px"
      @open="fetchMembers"
    >
      <!-- 搜索群组成员 -->
      <template #header>
        <SearchInput
          @search="handleSearch"
          @clear="isSearching = false"
          class="drawer-header"
        />
      </template>
      <!-- 搜索成员结果 -->
      <div class="drawer-content-wrapper">
        <el-popover placement="bottom" :width="280" trigger="click">
          <template #reference>
            <el-button class="invitation">邀请成员</el-button>
          </template>

          <!-- 可邀请的好友列表 开始 -->
          <div class="invite-popover-content">
            <el-scrollbar height="300px">
              <p v-if="friendList.length === 0">暂无可邀请好友</p>

              <div
                v-for="friend in friendList"
                :key="friend._id"
                class="friend-selectable-item"
                :class="{
                  'is-selected': selectedFriendIds.includes(friend._id)
                }"
                @click="toggleSelection(friend._id)"
              >
                <UserBadge
                  :username="friend.username"
                  :avatar="friend.avatar"
                  class="friend-list"
                />

                <el-icon
                  v-if="selectedFriendIds.includes(friend._id)"
                  class="selected-icon"
                >
                  <Check />
                </el-icon>
              </div>
            </el-scrollbar>
            <!-- 可邀请的好友列表 结束 -->

            <div class="popover-footer">
              <el-button @click="handleSendInvitations" class="invitation">
                发送邀请 ({{ selectedFriendIds.length }})
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>

      <el-divider>群组成员 ({{ displayedMembers.length }})</el-divider>

      <!-- 群组成员列表 开始-->
      <el-scrollbar
        class="members-list-scrollbar"
        v-infinite-scroll="loadMoreMembers"
        :infinite-scroll-disabled="isLoadingMore || !canLoadMore"
        :infinite-scroll-delay="300"
        :infinite-scroll-distance="20"
      >
        <div class="members" v-loading="loading">
          <div
            class="member-item"
            v-for="member in displayedMembers"
            :key="member._id"
          >
            <UserBadge
              :username="member.username"
              :avatar="member.avatar"
              class="member"
            />
            <div
              class="action has-active-scale-effect"
              @click="handleKickMember(member._id)"
            >
              <el-icon class="kick"><IconMdiAccountRemove /></el-icon>
            </div>
          </div>

          <p v-if="isLoadingMore" class="loading-tip">正在加载更多...</p>
          <p
            v-if="isSearching && !canLoadMore && displayedMembers.length > 0"
            class="loading-tip"
          >
            没有更多了
          </p>

          <el-empty
            v-if="displayedMembers.length === 0 && !loading"
            :description="
              isSearching ? '没有找到相关成员' : '群组内暂无其他成员'
            "
          />
        </div>
      </el-scrollbar>
      <!-- 群组成员列表 结束-->
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/ui-effects.scss' as *;

/*------------------------------------*\
 # 容器基础布局
 # 描述：定义聊天内容区域的整体弹性布局，使其垂直填充可用空间。
\*------------------------------------*/
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/*------------------------------------*\
 # 会话头部样式
 # 描述：设置会话头部的高度，并防止其收缩。
\*------------------------------------*/
.conversation-header {
  max-height: 40px;
  flex-shrink: 0;
}

/*------------------------------------*\
 # 消息列表容器样式
 # 描述：使消息列表区域填充剩余空间并支持滚动。
\*------------------------------------*/
.message-container {
  width: 100%;
  flex-grow: 1;
}

/*------------------------------------*\
 # 消息输入框容器样式
 # 描述：设置输入框区域的高度自适应内容，并防止其收缩。
\*------------------------------------*/
.input-container {
  height: auto;
  flex-shrink: 0;
}

/*------------------------------------*\
 # 抽屉关闭按钮样式覆盖
 # 描述：调整 Element Plus 抽屉关闭按钮的内边距。
\*------------------------------------*/
:deep(.el-drawer__close-btn) {
  padding-right: 0;
}

/*------------------------------------*\
 # 邀请按钮样式
 # 描述：定义邀请成员按钮的宽度、下边距和颜色。
\*------------------------------------*/
.invitation {
  width: 100%;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

/*------------------------------------*\
 # 邀请按钮悬停样式
 # 描述：定义邀请按钮在悬停时的边框和背景颜色。
\*------------------------------------*/
.invitation:hover {
  border-color: var(--el-btn-hover-border-color);
  background-color: transparent;
}

/*------------------------------------*\
 # 抽屉头部样式覆盖
 # 描述：移除 Element Plus 抽屉头部默认的下边距。
\*------------------------------------*/
:deep(.el-drawer__header) {
  margin-bottom: 0;
}

/*------------------------------------*\
 # 可选择好友项布局
 # 描述：定义邀请好友列表中每个好友项的布局和对齐方式。
\*------------------------------------*/
.friend-selectable-item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-icon {
    margin-left: 12px;
  }
}

.invite-popover-content p {
  padding-top: 30px;
  text-align: center;
}
/*------------------------------------*\
 # 成员徽章和好友列表样式
 # 描述：确保成员徽章和好友列表项占据其容器的全部宽度。
\*------------------------------------*/
.members .member,
.friend-selectable-item .friend-list {
  width: 100%;
}

/*------------------------------------*\
 # 加载提示文本样式
 # 描述：定义加载更多或无结果提示文本的内边距、颜色和对齐方式。
\*------------------------------------*/
.loading-tip {
  padding: 20px 0;
  color: var(--el-text-color-quoted);
  text-align: center;
}

/*------------------------------------*\
 # 成员列表滚动条高度
 # 描述：设置群组成员列表滚动区域的高度，并隐藏溢出内容。
\*------------------------------------*/
.members-list-scrollbar {
  height: 78%;
  overflow: hidden;
}

/*------------------------------------*\
 # 成员列表项样式
 # 描述：定义单个群组成员列表项的布局和底部间距。
\*------------------------------------*/
.member-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/*------------------------------------*\
 # 成员列表项悬停样式
 # 描述：定义成员列表项在鼠标悬停时的背景颜色。
\*------------------------------------*/
.member-item:hover {
  background-color: var(--el-bg-color-message-item-hover);
}

/*------------------------------------*\
 # 踢出成员操作按钮样式
 # 描述：定义踢出成员图标的初始隐藏状态和过渡效果。
\*------------------------------------*/
.member-item .action {
  padding: 4px;
  opacity: 0; /* 默认隐藏 */
  pointer-events: none; /* 默认不响应事件 */
  transition: opacity 0.2s;
}

/*------------------------------------*\
 # 踢出成员操作按钮悬停样式
 # 描述：定义当鼠标悬停在成员项上时，踢出按钮的显示和样式。
\*------------------------------------*/
.member-item:hover .action {
  opacity: 1; /* 悬停时显示 */
  pointer-events: auto; /* 悬停时响应事件 */
  cursor: pointer;
  color: var(--primary-text-color);
}
</style>
