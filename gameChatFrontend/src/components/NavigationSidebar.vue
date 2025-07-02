<script setup>
import { CirclePlus, Setting } from '@element-plus/icons-vue'
import ThemeSwitch from '@/components/ThemeToggle.vue'
import CreateGroupDialog from './CreateGroupDialog.vue'
import { ref } from 'vue'
import { useGroupStore, useUserStore, useChatStore } from '@/stores'
import UploadUserAvatarDialog from './UploadUserAvatarDialog.vue'
import ResetPwdDialog from './ResetPwdDialog.vue'
import UpdateUserInfoDialog from './UpdateUserInfoDialog.vue'
import LogoutConfirmDialog from './LogoutConfirmDialog.vue'
import DeleteUserConfirmDialog from './DeleteUserConfirmDialog.vue'
import router from '@/router'
import { storeToRefs } from 'pinia'
import GroupAvatar from './common/GroupAvatar.vue'

const groupStore = useGroupStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const { groups } = storeToRefs(groupStore)
const showCreateGroup = ref(false)
const props = defineProps({
  phoneNum: String
})
const showUploadUserAvatarDialog = ref(false)
const showUpdatePwdDialog = ref(false)
const showUpdateUserInfoDialog = ref(false)
const showLogoutConfirmDialog = ref(false)
const showDeleteUserConfirmDialog = ref(false)

const saveActiveGroup = (groupId) => {
  const group = groups.value.find((g) => g._id === groupId)
  if (group) {
    groupStore.setActiveGroup(group)
    chatStore.clearActiveConversation()
    router.push('/chat')
  }
}

const handleUploadSuccess = (data) => {
  userStore.userInfo.avatar = data
}

const showFriendList = () => {
  groupStore.clearActiveGroup()
  chatStore.clearActiveConversation()
  router.push('/chat/friends')
}
</script>

<template>
  <div class="sidebar-container">
    <div class="direct-message" @click="showFriendList">
      <UserAvatar
        :src="userStore.userInfo.avatar"
        alt="私信"
        class="direct-message-image has-active-scale-effect"
      />
    </div>

    <el-scrollbar class="group-list-scrollbar">
      <el-menu
        class="group-container"
        :collapse="true"
        @select="saveActiveGroup"
      >
        <el-menu-item
          class="groupList"
          v-for="item in groups"
          :key="item._id"
          :index="item._id"
        >
          <GroupAvatar
            :src="item.avatar || '/images/defaultGroupAvatar.png'"
            :alt="item.name"
            :lazy="true"
          />
          <template #title>{{ item.name || '群组' }}</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
    <el-menu class="bottomBox">
      <el-menu-item
        index="1"
        class="create-group"
        @click="showCreateGroup = !showCreateGroup"
      >
        <el-icon class="has-active-scale-effect"><CirclePlus /></el-icon>
      </el-menu-item>
      <el-dropdown
        placement="right-start"
        class="dropdown-setting"
        :popper-options="{
          modifiers: [{ name: 'offset', options: { offset: [60, 0] } }]
        }"
      >
        <el-menu-item index="2">
          <el-icon class="has-active-scale-effect"><Setting /></el-icon>
        </el-menu-item>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showUploadUserAvatarDialog = true"
              >更换头像</el-dropdown-item
            >
            <el-dropdown-item @click="showUpdateUserInfoDialog = true"
              >更新个人信息</el-dropdown-item
            >
            <el-dropdown-item @click="showUpdatePwdDialog = true"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item divided @click="showLogoutConfirmDialog = true"
              >退出登录</el-dropdown-item
            >
            <el-dropdown-item
              divided
              @click="showDeleteUserConfirmDialog = true"
              >注销账户</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-menu-item index="3">
        <ThemeSwitch class="theme-switch has-active-scale-effect" />
      </el-menu-item>
    </el-menu>
  </div>
  <CreateGroupDialog v-model:visible="showCreateGroup" v-if="showCreateGroup" />
  <UploadUserAvatarDialog
    v-model:visible="showUploadUserAvatarDialog"
    v-if="showUploadUserAvatarDialog"
    @upload-success="handleUploadSuccess"
  ></UploadUserAvatarDialog>
  <ResetPwdDialog
    v-model:visible="showUpdatePwdDialog"
    :phoneNum="phoneNum"
    v-if="showUpdatePwdDialog"
  ></ResetPwdDialog>
  <UpdateUserInfoDialog
    v-model:visible="showUpdateUserInfoDialog"
    :phoneNum="phoneNum"
    v-if="showUpdateUserInfoDialog"
  ></UpdateUserInfoDialog>
  <LogoutConfirmDialog
    v-model:visible="showLogoutConfirmDialog"
    v-if="showLogoutConfirmDialog"
  ></LogoutConfirmDialog>
  <DeleteUserConfirmDialog
    v-model:visible="showDeleteUserConfirmDialog"
    v-if="showDeleteUserConfirmDialog"
  ></DeleteUserConfirmDialog>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/ui-effects.scss' as *;

.sidebar-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 90px;
  height: 100vh;
}

.direct-message {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  text-align: center;
  border-bottom: 1px solid var(--primary-text-color);
}

.group-container {
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-top: 20px;
  flex-direction: column;
  width: 90px;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.group-container img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
}

.group-container .el-menu-item {
  margin-bottom: 12px;
}

.group-container .el-menu-item:hover,
.bottomBox .el-menu-item:hover {
  background-color: transparent;
}

.el-menu-item .el-icon {
  font-size: 30px;
}

.bottomBox {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.el-menu-item .theme-switch {
  padding: 0;
  font-size: 12px;
  cursor: pointer;
}

.bottomBox .el-menu-item {
  color: var(--primary-text-color);
}

.el-menu {
  border-right: 0;
}

:deep(.el-dropdown-menu__item:not(.is-disabled):focus),
:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--el-dropdown-menu-item-hover);
}
</style>
