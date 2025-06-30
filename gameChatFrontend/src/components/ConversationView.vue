<script setup>
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

onMounted(() => {
  friendStore.getList()
})

const fetchMembers = async () => {
  loading.value = true
  isSearching.value = false
  searchResults.value = []
  currentSearchTerm.value = ''
  groupStore.fetchGroupMembers()
  loading.value = false
}

// 切换选中好友
const toggleSelection = (friendId) => {
  const index = selectedFriendIds.value.indexOf(friendId)
  if (index > -1) {
    selectedFriendIds.value.splice(index, 1)
  } else {
    selectedFriendIds.value.push(friendId)
  }
}

const handleSendInvitations = async () => {
  if (selectedFriendIds.value.length === 0) return
  const groupId = groupStore.activeGroupId
  try {
    const response = await sendGroupInvitation({
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

const displayedMembers = computed(() => {
  return isSearching.value ? searchResults.value : groupMembers.value
})

const canLoadMore = computed(() => {
  return isSearching.value && currentSearchPage.value < totalSearchPages.value
})

const handleKickMember = async (memberId) => {
  groupStore.handleKickGroupMember(memberId)
}
</script>

<template>
  <div class="container">
    <ConversationHeader
      class="conversation-header"
      @open-member-drawer="memberDrawerVisible = true"
    />

    <MessageList class="message-container" />

    <MessageInput class="input-container" />

    <el-drawer
      v-model="memberDrawerVisible"
      direction="rtl"
      size="300px"
      @open="fetchMembers"
    >
      <template #header>
        <SearchInput
          @search="handleSearch"
          @clear="isSearching = false"
          class="drawer-header"
        />
      </template>

      <div class="drawer-content-wrapper">
        <el-popover placement="bottom" :width="280" trigger="click">
          <template #reference>
            <el-button class="invitation">邀请成员</el-button>
          </template>

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

            <div class="popover-footer">
              <el-button @click="handleSendInvitations" class="invitation">
                发送邀请 ({{ selectedFriendIds.length }})
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>

      <el-divider>群组成员 ({{ displayedMembers.length }})</el-divider>

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
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/ui-effects.scss' as *;

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.conversation-header {
  max-height: 40px;
  flex-shrink: 0;
}

.message-container {
  width: 100%;
  // flex: 1;
  flex-grow: 1;
}

.input-container {
  // height: 100px;
  height: auto;
  flex-shrink: 0;
}

:deep(.el-drawer__close-btn) {
  padding-right: 0;
}

.invitation {
  width: 100%;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

.invitation:hover {
  border-color: var(--el-btn-hover-border-color);
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

.friend-selectable-item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-icon {
    margin-left: 12px;
  }
}

.members .member,
.friend-selectable-item .friend-list {
  width: 100%;
}

.loading-tip {
  padding: 20px 0;
  color: var(--el-text-color-quoted);
  text-align: center;
}

.members-list-scrollbar {
  height: 78%;
  overflow: hidden;
}

.member-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.member-item:hover {
  background-color: var(--el-bg-color-message-item-hover);
}

.member-item .action {
  padding: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.member-item:hover .action {
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
  color: var(--primary-text-color);
}
</style>
