<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useChatStore, useGroupStore } from '@/stores'
import UserAvatar from './common/UserAvatar.vue'
import { storeToRefs } from 'pinia'
import GroupAvatar from './common/GroupAvatar.vue'

const emit = defineEmits(['open-member-drawer'])

const searchInputShow = ref(false)
const chatStore = useChatStore()
const groupStore = useGroupStore()
const { isGroupActive } = storeToRefs(groupStore)

const handleOpenDrawer = () => {
  emit('open-member-drawer')
}

const currentHeader = computed(() => {
  console.log('--- Header 正在重新计算 ---')
  console.log('isGroupActive 的值是:', isGroupActive.value)
  console.log(
    'groupStore.activeGroup 的值是:',
    JSON.parse(JSON.stringify(groupStore.activeGroup))
  )
  console.log(
    'chatStore.activeConversationPartner 的值是:',
    JSON.parse(JSON.stringify(chatStore.activeConversationPartner))
  )
  return isGroupActive.value
    ? groupStore.activeGroup
    : chatStore.activeConversationPartner
})
</script>

<template>
  <div class="container">
    <div class="header-container">
      <UserAvatar
        :src="currentHeader.avatar"
        alt="头像"
        size="30"
        v-if="!isGroupActive"
      />
      <GroupAvatar :src="currentHeader.avatar" alt="头像" size="30" v-else />
      <div class="friend-name">
        {{ currentHeader.name || currentHeader.username }}
      </div>
    </div>
    <div class="icon-container">
      <el-input v-show="searchInputShow" placeholder="搜索信息" />
      <div class="search icon">
        <el-icon @click="searchInputShow = !searchInputShow"
          ><Search
        /></el-icon>
      </div>
      <div class="group-members icon" v-if="isGroupActive">
        <IconMdiAccountMultiple class="icon" @click="handleOpenDrawer" />
      </div>
      <div class="notifications-off icon">
        <IconIcBaselineNotificationsOff class="icon" />
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

.header-container .friend-name {
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
}

// 输入框背景透明
::v-deep(.el-input__wrapper) {
  background-color: transparent;
}
</style>
