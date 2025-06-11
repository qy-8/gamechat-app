<script setup>
import { ref, onMounted } from 'vue'
import ConversationHeader from './ConversationHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import SearchInput from './common/SearchInput.vue'
import { getGroupMembers, sendGroupInvitation } from '../api/group'
import { useGroupStore, useFriendStore } from '../stores'
import UserBadge from './common/UserBadge.vue'
import { storeToRefs } from 'pinia'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const memberDrawerVisible = ref(false)
const loading = ref(false)
const groupStore = useGroupStore()
const friendStore = useFriendStore()
const groupMembers = ref([])
const { friendList } = storeToRefs(friendStore)
const selectedFriendIds = ref([])

onMounted(() => {
  friendStore.getList()
})

const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await getGroupMembers(groupStore.activeGroupId)
    groupMembers.value = response.data.members
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
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
        <SearchInput @search="handleSearch" class="drawer-header" />
      </template>

      <div class="drawer-content-wrapper">
        <el-popover placement="bottom" :width="280" trigger="click">
          <template #reference>
            <el-button type="regular" class="invitation">邀请成员</el-button>
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
              <el-button
                type="regular"
                @click="handleSendInvitations"
                class="invitation"
              >
                发送邀请 ({{ selectedFriendIds.length }})
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>
      <el-divider>群组成员 ( {{ groupMembers.length }} )</el-divider>
      <div class="members" v-loading="loading">
        <UserBadge
          v-for="member in groupMembers"
          :key="member._id"
          :username="member.username"
          :avatar="member.avatar"
        />
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.conversation-header {
  max-height: 40px;
}

.message-container {
  width: 100%;
  flex: 1;
}

.input-container {
  height: 100px;
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
</style>
