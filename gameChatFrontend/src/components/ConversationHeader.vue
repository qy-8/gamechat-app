<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useChatStore, useGroupStore } from '@/stores'
import UserAvatar from './common/UserAvatar.vue'
import { storeToRefs } from 'pinia'
import GroupAvatar from './common/GroupAvatar.vue'

const emit = defineEmits(['open-member-drawer'])

const searchInputShow = ref(false)
const chatStore = useChatStore()
const groupStore = useGroupStore()
// const { headerInfo } = storeToRefs(chatStore)
const { isGroupActive } = storeToRefs(groupStore)

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
      <el-input v-show="searchInputShow" placeholder="搜索信息" />
      <div class="search icon">
        <el-icon @click="searchInputShow = !searchInputShow"
          ><Search
        /></el-icon>
      </div>
      <div class="group-members icon" v-if="isGroupActive === true">
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
}

// 输入框背景透明
::v-deep(.el-input__wrapper) {
  background-color: transparent;
}
</style>
