<script setup>
/**
 * @file ChatHeader.vue
 * @description 聊天界面头部组件，显示当前会话信息（群组或用户），并提供搜索、成员列表和消息免打扰功能。
 * @component ChatHeader
 * @emits open-member-drawer - 当点击群组成员图标时触发，用于打开成员抽屉。
 */
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useChatStore, useGroupStore, useUserStore } from '@/stores'
import UserAvatar from './common/UserAvatar.vue'
import { storeToRefs } from 'pinia'
import GroupAvatar from './common/GroupAvatar.vue'

const emit = defineEmits(['open-member-drawer'])

// 控制搜索输入框的显示/隐藏
const searchInputShow = ref(false)
// 搜索关键词
const searchTerm = ref(null)
const chatStore = useChatStore()
const groupStore = useGroupStore()
const userStore = useUserStore()
const { isGroupActive } = storeToRefs(groupStore)
const { isMuted } = storeToRefs(userStore)
const { toggleMute } = userStore
const { activeConversation, searchResults } = storeToRefs(chatStore)
const { searchMessagesInConversation, clearSearchResults } = chatStore

// 计算当前会话的头部信息（群组或用户）
const currentHeader = computed(() => {
  if (isGroupActive.value) {
    return groupStore.activeGroup
  } else {
    return chatStore.activeConversationPartner
  }
})

// 处理打开成员抽屉事件
const handleOpenDrawer = () => {
  emit('open-member-drawer')
}

// 判断当前聊天是否处于免打扰状态
const isCurrentChatMuted = computed(() => {
  const currentId = chatStore.activeConversation?._id
  if (!currentId) return false
  return isMuted.value(currentId)
})

// 切换当前聊天的免打扰状态
const handleToggleMute = () => {
  const currentId = chatStore.activeConversation?._id
  if (!currentId) return
  toggleMute(currentId, !isCurrentChatMuted.value)
}

// 监听搜索框显示状态变化，隐藏时清空搜索内容和结果
watch(searchInputShow, (newValue) => {
  if (!newValue) {
    searchTerm.value = ''
    clearSearchResults()
  }
})

// 处理消息搜索
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
</script>

<template>
  <div class="container">
    <!-- 群组/用户头像名称显示区域 -->
    <div class="header-container">
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
    <!-- 头部工具 -->
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
/*------------------------------------*\
 # 头部容器样式
 # 描述：定义聊天头部整体布局和背景。
\*------------------------------------*/
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

/*------------------------------------*\
 # 群组头像尺寸
 # 描述：定义群组头像的固定尺寸和圆角。
\*------------------------------------*/
.container .group-img {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

/*------------------------------------*\
 # 头部名称样式
 # 描述：设置会话名称的左侧内边距和字体大小。
\*------------------------------------*/
.header-container .name {
  padding-left: 6px;
  font-size: 12px;
}

/*------------------------------------*\
 # 头部信息容器样式
 # 描述：定义左侧头像和名称的布局。
\*------------------------------------*/
.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
}

/*------------------------------------*\
 # 图标容器样式
 # 描述：定义右侧功能图标的布局。
\*------------------------------------*/
div.icon-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*------------------------------------*\
 # 通用图标样式
 # 描述：设置所有功能图标的通用外边距和鼠标样式。
\*------------------------------------*/
.icon-container .icon {
  margin: 0 6px;
  cursor: pointer;
}

/*------------------------------------*\
 # 搜索图标右侧间距
 # 描述：调整搜索图标的右侧内边距。
\*------------------------------------*/
.icon-container .search {
  padding-right: 6px;
}

/*------------------------------------*\
 # 搜索输入框样式
 # 描述：设置搜索输入框的宽度、高度和字体大小。
\*------------------------------------*/
.icon-container .el-input {
  width: 160px;
  height: 24px;
  font-size: 12px;
  line-height: 10px;
}

/*------------------------------------*\
 # Element Plus 输入框背景透明
 # 描述：覆盖 Element Plus 输入框的默认背景，使其透明。
\*------------------------------------*/
::v-deep(.el-input__wrapper) {
  background-color: transparent;
}
</style>
