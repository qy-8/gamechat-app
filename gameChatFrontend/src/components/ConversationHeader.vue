<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useChatStore, useGroupStore, useUserStore } from '@/stores'
import UserAvatar from './common/UserAvatar.vue'
import { storeToRefs } from 'pinia'
import GroupAvatar from './common/GroupAvatar.vue'

const emit = defineEmits(['open-member-drawer'])

const searchInputShow = ref(false)
const searchTerm = ref(null)
const chatStore = useChatStore()
const groupStore = useGroupStore()
const userStore = useUserStore()
// const { headerInfo } = storeToRefs(chatStore)
const { isGroupActive } = storeToRefs(groupStore)
const { isMuted } = storeToRefs(userStore)
const { toggleMute } = userStore
const { activeConversation, searchResults } = storeToRefs(chatStore)
const { searchMessagesInConversation, clearSearchResults } = chatStore

const currentHeader = computed(() => {
  if (isGroupActive.value) {
    return groupStore.activeGroup
  } else {
    return chatStore.activeConversationPartner
  }
})

const handleOpenDrawer = () => {
  emit('open-member-drawer')
}

const isCurrentChatMuted = computed(() => {
  const currentId = chatStore.activeConversation?._id
  if (!currentId) return false
  return isMuted.value(currentId)
})

const handleToggleMute = () => {
  const currentId = chatStore.activeConversation?._id
  if (!currentId) return
  toggleMute(currentId, !isCurrentChatMuted.value)
}

watch(searchInputShow, (newValue) => {
  if (!newValue) {
    // 当搜索框隐藏时，清空搜索词和搜索结果
    searchTerm.value = ''
    clearSearchResults()
  }
})

const handleSearchMessages = async () => {
  if (!activeConversation.value?._id) {
    console.warn('当前没有活跃会话，无法搜索消息。')
    return
  }
  await searchMessagesInConversation(
    activeConversation.value._id,
    searchTerm.value
  )
}

// 用户搜索调用 handleSearchMessages
// const onSearchInputEnter = () => {
//   handleSearchMessages()
// }
</script>

<template>
  <div class="container">
    <div class="header-container" @click="console.log(headerInfo)">
      <GroupAvatar
        :src="currentHeader.avatar"
        alt="头像"
        :size="30"
        v-if="isGroupActive === true"
      />
      <UserAvatar :src="currentHeader.avatar" alt="头像" :size="30" v-else />

      <div class="name">
        {{ currentHeader.name || currentHeader.username }}
      </div>
    </div>
    <div class="icon-container">
      <el-input
        v-show="searchInputShow"
        v-model="searchTerm"
        placeholder="搜索消息"
        @keyup.enter="handleSearchMessages"
      />
      <div class="search icon">
        <el-icon @click="searchInputShow = !searchInputShow"
          ><Search
        /></el-icon>
      </div>

      <div class="group-members icon" v-if="isGroupActive === true">
        <IconMdiAccountMultiple class="icon" @click="handleOpenDrawer" />
      </div>
      <div class="notifications-off icon" @click="handleToggleMute">
        <IconIcBaselineNotificationsOff
          v-if="isCurrentChatMuted"
          class="icon"
        />
        <IconIcBaselineNotifications v-else class="icon" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
div.container {
  width: 100%;
  padding: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-group-list);
  color: var(--el-text-color-regular);
}

.container .group-img {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

.header-container .name {
  padding-left: 6px;
  font-size: 12px;
}

.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
}

div.icon-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon-container .icon {
  margin: 0 6px;
  cursor: pointer;
}

.icon-container .search {
  padding-right: 6px;
}

.icon-container .el-input {
  width: 160px;
  height: 24px;
  font-size: 12px;
  line-height: 10px;
}

// 输入框背景透明
::v-deep(.el-input__wrapper) {
  background-color: transparent;
}
</style>
