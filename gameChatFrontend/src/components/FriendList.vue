<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import {
  searchFriend,
  sendFriendRequest,
  deleteFriend,
  updateFriendStatus,
  getBlackList
} from '../api/friend'
import {
  ArrowDown,
  Search,
  Plus,
  DeleteFilled,
  Hide,
  View
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FriendRequestListDialog from './FriendRequestListDialog.vue'
import GroupRequestListDialog from './GroupRequestListDialog.vue'
import { useChatStore, useFriendStore, useGroupStore } from '../stores'
import { storeToRefs } from 'pinia'
import UserBadge from './common/UserBadge.vue'

// import { useDraggableWidth } from '@/composables/useDraggableWidth'

const chatStore = useChatStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const { unreadGroupInvitation } = storeToRefs(groupStore)
const form = reactive({
  username: ''
})
const formRef = ref(null)
const rules = reactive({
  username: [
    { message: '', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]{3,15}$/,
      message: '',
      trigger: 'blur'
    }
  ]
})
const showSearchResult = ref(false)
const searchResult = ref({
  username: '用户名',
  avatar: '/images/defaultUserAvatar.png'
})
const searchResultIsEmpty = ref(false)
const showFriendRequestListDialog = ref(false)
const showGroupRequestListDialog = ref(false)
const showDeleteIcon = ref(false)
const showBlockIcon = ref(false)
const showBlockList = ref(false)
const loading = ref(false)
const blackList = ref([])
const friendListPanelRef = ref(null)

const { conversations } = storeToRefs(chatStore)
const { unreadRequestCount } = storeToRefs(friendStore)

onMounted(async () => {
  friendStore.getList()
  friendStore.getIncomingRequests()
  groupStore.getGroupInvitations()
})

const { friendList } = storeToRefs(friendStore)

const handleSearchUsername = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('验证失败')
      return
    }

    try {
      const response = await searchFriend(form.username)
      searchResult.value = response.data
      if (searchResult.value.length <= 0) {
        searchResultIsEmpty.value = true
      } else {
        searchResultIsEmpty.value = false
      }
      showSearchResult.value = true
    } catch (error) {
      console.error(error)
    }
  })
}

const friendsWithUnreadCount = computed(() => {
  const unreadMap = new Map()
  if (conversations.value && conversations.value.length > 0) {
    conversations.value.forEach((conv) => {
      unreadMap.set(conv.targetParticipant?._id, conv.unreadCount)
    })
  }
  return friendList.value.map((friend) => {
    return {
      ...friend,
      unreadCount: unreadMap.get(friend._id)
    }
  })
})

const handleSendFriendRequest = async () => {
  if (searchResult.value) {
    try {
      await sendFriendRequest(searchResult.value[0]._id)
      ElMessage.success('好友请求已发送！')
    } catch (error) {
      console.log(error)
    }
  } else {
    ElMessage.warning('无法发送好友请求')
  }
}

const deleteSelectedFriend = async (friendId) => {
  loading.value = true

  if (friendId) {
    friendStore.deleteFriend(friendId)
  }
  loading.value = false
  showDeleteIcon.value = false
}

const updateSelectedFriendStatus = async (friendId, status) => {
  loading.value = true

  if (friendId) {
    try {
      const response = await updateFriendStatus({ friendId, status })
      ElMessage.success('拉黑成功')
      await getBlockedList()
      await getList()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
      showBlockIcon.value = false
    }
  }
}

const showBlockFriends = async (showBlock) => {
  loading.value = true
  try {
    if (showBlock) {
      await getBlockedList()
      showBlockList.value = true
      loading.value = false
    } else {
      showBlockList.value = false
      loading.value = false
    }
  } catch (error) {
    console.error(error)
  }
}

const getBlockedList = async () => {
  try {
    const response = await getBlackList()
    blackList.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const selectFriendForChat = (friend) => {
  chatStore.setActiveFriend(friend)
  groupStore.clearActiveGroup()
  chatStore.selectFriendToChat(friend)
}

// const { startDragging } = useDraggableWidth(friendListPanelRef, {
//   minWidth: 200,
//   maxWidth: 500
// })
</script>

<template>
  <div v-loading="loading" class="container" ref="friendListPanelRef">
    <div class="title-menu-container">
      <div class="title-and-search-container">
        <div class="direct-message-title">我的私信</div>
        <el-dropdown
          placement="bottom-end"
          dropdown-class="custom-dropdown"
          size="large"
        >
          <el-icon class="has-active-scale-effect"><ArrowDown /></el-icon>

          <template #dropdown>
            <el-dropdown-menu class="group-setting-dropdown">
              <el-dropdown-item
                @click="
                  showFriendRequestListDialog = !showFriendRequestListDialog
                "
                >收到的好友请求
                <div
                  class="new-message friend-request"
                  v-if="unreadRequestCount > 0"
                >
                  {{ unreadRequestCount }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                @click="
                  showGroupRequestListDialog = !showGroupRequestListDialog
                "
                >收到的群组邀请
                <div
                  class="new-message group-invitations"
                  v-if="unreadGroupInvitation > 0"
                >
                  {{ unreadGroupInvitation }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                @click="showBlockFriends(true)"
                v-if="!showBlockList"
                >黑名单</el-dropdown-item
              >
              <el-dropdown-item divided @click="showBlockFriends(false)" v-else
                >好友列表</el-dropdown-item
              >
              <el-dropdown-item
                @click="showBlockIcon = true"
                v-if="!showBlockIcon"
                >拉黑好友</el-dropdown-item
              >
              <el-dropdown-item @click="showBlockIcon = false" v-else
                >取消拉黑好友</el-dropdown-item
              >
              <el-dropdown-item
                divided
                @click="showDeleteIcon = true"
                v-if="!showDeleteIcon"
                >删除好友</el-dropdown-item
              >
              <el-dropdown-item divided @click="showDeleteIcon = false" v-else
                >取消删除好友</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="search-and-result-container">
        <div class="search-friend-container">
          <el-form :model="form" ref="formRef" :rules="rules">
            <el-form-item prop="username" class="direct-message-input">
              <el-input v-model="form.username" placeholder="搜索用户名" />
            </el-form-item>
          </el-form>
          <el-icon class="has-active-scale-effect" @click="handleSearchUsername"
            ><Search
          /></el-icon>
        </div>
        <div class="result" v-if="showSearchResult">
          <div class="user-result-panel" v-if="!searchResultIsEmpty">
            <div class="user-container">
              <UserAvatar :src="searchResult[0].avatar" />
              <span class="username">{{
                searchResult[0].username || '用户名'
              }}</span>
            </div>
            <el-icon
              class="has-active-scale-effect"
              @click="handleSendFriendRequest"
              ><Plus
            /></el-icon>
          </div>
          <div class="empty-result-panel" v-else>未找到相关用户</div>
        </div>
      </div>
      <el-menu class="panel" ref="groupInfo" v-if="!showBlockList">
        <el-menu-item
          v-for="item in friendsWithUnreadCount"
          :key="item._id"
          :index="item._id"
          class="panel-item"
          @click="selectFriendForChat(item)"
        >
          <UserBadge :username="item.username" :avatar="item.avatar" />
          <div class="new-message" v-if="item.unreadCount > 0">
            {{ item.unreadCount }}
          </div>
          <el-icon
            class="has-active-scale-effect"
            @click="updateSelectedFriendStatus(item._id, 'blocked')"
            v-if="showBlockIcon"
            ><Hide
          /></el-icon>

          <el-icon
            class="deleteIcon has-active-scale-effect"
            @click="deleteSelectedFriend(item._id)"
            v-if="showDeleteIcon"
            ><DeleteFilled
          /></el-icon>
        </el-menu-item>
      </el-menu>
      <el-menu class="panel" v-if="showBlockList">
        <el-menu-item
          v-for="item in blackList"
          :key="item._id"
          :index="item._id"
          class="panel-item"
          ><span>{{ item.username }}</span>
          <el-icon
            class="has-active-scale-effect"
            @click="updateSelectedFriendStatus(item._id, 'friends')"
            ><View
          /></el-icon>
        </el-menu-item>
      </el-menu>
      <div class="listIsEmpty" v-if="blackList.length <= 0 && showBlockList">
        您的黑名单是空的
      </div>
      <div class="listIsEmpty" v-if="friendList.length <= 0 && !showBlockList">
        您的好友列表是空的
      </div>
    </div>
    <div class="resize-bar" @mousedown="startDragging"></div>
  </div>

  <FriendRequestListDialog
    v-model:visible="showFriendRequestListDialog"
    v-if="showFriendRequestListDialog"
  ></FriendRequestListDialog>
  <GroupRequestListDialog
    v-model:visible="showGroupRequestListDialog"
    v-if="showGroupRequestListDialog"
  />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/chat/_shared-chat-layout.scss' as *;
@use '@/assets/styles/ui-effects.scss' as *;

.container {
  flex-direction: row;
  color: var(--primary-text-color);
  background-color: var(--el-bg-color-group-list);
}

.search-and-result-container {
  height: auto;
}

.direct-message-title {
  font-size: 28px;
  color: var(--primary-text-color);
}

.direct-message-title:hover {
  background-color: transparent;
}

.direct-message-input {
  margin-bottom: 0;
}

.title-and-search-container {
  padding: 10px 20px;
}

.el-icon {
  font-size: 20px;
  color: var(--primary-text-color);
}

.search-friend-container {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  height: auto;
  padding: 12px 10px 0 10px;
  padding-bottom: 13px;
}

.search-friend-container .el-icon {
  margin-left: 16px;
}

.result {
  position: absolute;
  display: flex;
  align-items: center;
  width: 250px;
  height: 58px;
  background-color: var(--el-bg-color-search-user-result);
  padding-right: 10px;
  color: #e0911a;
  z-index: 4;
  .el-icon {
    margin-right: 10px;
  }
}

.user-result-panel {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.user-container {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 6px;
  color: var(--primary-text-color);

  img {
    height: 100%;
    border-radius: 50%;
  }

  span {
    margin-left: 14px;
  }
}

.panel-item:hover {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.empty-result-panel {
  width: 100%;
  display: flex;
  justify-content: center;
  // align-items: center;
}

:deep(.direct-message-input .el-input .el-input__wrapper) {
  box-shadow: none;
  background-color: transparent;
}

.search-friend-container {
  border-radius: 20px;
}

.el-menu-item.is-active i {
  color: var(--el-text-color-primary);
}

.el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.listIsEmpty {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.new-message {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--el-bg-color-announcements);
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

.new-message.friend-request,
.new-message.group-invitations {
  margin-left: 12px;
  color: var(--secondary-text-color);
}

.resize-bar {
  width: 4px;
  // cursor: ew-resize;
  background-color: var(--el-bg-color-home-details-box-bgc);
  // transition: background-color 0.2s;
}

.el-menu {
  border: none;
}
</style>
