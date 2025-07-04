<script setup>
/**
 * @file SideBar.vue
 * @description 应用程序的侧边栏导航组件，显示用户头像、群组列表、创建群组入口和用户设置选项。
 * @component SideBar
 * @property {string} phoneNum - 用户的电话号码（可能用于某些对话框）。
 */
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
import UserAvatar from './common/UserAvatar.vue' // 确保导入 UserAvatar

const groupStore = useGroupStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const { groups } = storeToRefs(groupStore)
const showCreateGroup = ref(false)
const props = defineProps({
  phoneNum: String
})
// 控制各种用户相关设置的显示状态
const showUploadUserAvatarDialog = ref(false)
const showUpdatePwdDialog = ref(false)
const showUpdateUserInfoDialog = ref(false)
const showLogoutConfirmDialog = ref(false)
const showDeleteUserConfirmDialog = ref(false)

/**
 * 保存当前活跃群组并导航到聊天页面。
 * @param {string} groupId - 被选中的群组 ID。
 */
const saveActiveGroup = (groupId) => {
  const group = groups.value.find((g) => g._id === groupId)
  if (group) {
    groupStore.setActiveGroup(group) // 设置活跃群组
    chatStore.clearActiveConversation() // 清除当前活跃会话
    router.push('/chat') // 导航到聊天页面
  }
}

/**
 * 处理用户头像上传成功。
 * @param {string} data - 上传成功后的新头像 URL。
 */
const handleUploadSuccess = (data) => {
  userStore.userInfo.avatar = data
}

/**
 * 显示好友列表。
 * 清除活跃群组和会话，并导航到好友列表页面。
 */
const showFriendList = () => {
  groupStore.clearActiveGroup() // 清除活跃群组
  chatStore.clearActiveConversation() // 清除活跃会话
  router.push('/chat/friends') // 导航到好友列表页
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

/*------------------------------------*\
 # 侧边栏容器样式
 # 描述：定义侧边栏的整体布局、宽度和高度，使其内容垂直分布。
\*------------------------------------*/
.sidebar-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 90px;
  height: 100vh;
}

/*------------------------------------*\
 # 私信入口样式
 # 描述：定义点击用户头像进入私信列表区域的内边距、布局和底部边框。
\*------------------------------------*/
.direct-message {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  text-align: center;
  border-bottom: 1px solid var(--primary-text-color);
}

/*------------------------------------*\
 # 群组列表容器样式
 # 描述：定义群组列表的弹性尺寸、顶部内边距和背景颜色。
\*------------------------------------*/
.group-container {
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-top: 20px;
  flex-direction: column;
  width: 90px;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 群组头像样式
 # 描述：定义群组头像的尺寸、圆角、适应方式和鼠标样式。
\*------------------------------------*/
.group-container img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
}

/*------------------------------------*\
 # 群组列表项样式
 # 描述：设置群组列表项的底部外边距。
\*------------------------------------*/
.group-container .el-menu-item {
  margin-bottom: 12px;
}

/*------------------------------------*\
 # 菜单项悬停样式
 # 描述：确保群组列表项和底部操作项在鼠标悬停时背景透明。
\*------------------------------------*/
.group-container .el-menu-item:hover,
.bottomBox .el-menu-item:hover {
  background-color: transparent;
}

/*------------------------------------*\
 # 菜单项图标尺寸
 # 描述：设置所有菜单项内图标的字体大小。
\*------------------------------------*/
.el-menu-item .el-icon {
  font-size: 30px;
}

/*------------------------------------*\
 # 底部操作框样式
 # 描述：定义侧边栏底部操作区（创建群组、设置、主题切换）的布局和背景。
\*------------------------------------*/
.bottomBox {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 主题切换按钮样式
 # 描述：调整主题切换按钮的内边距、字体大小和鼠标样式。
\*------------------------------------*/
.el-menu-item .theme-switch {
  padding: 0;
  font-size: 12px;
  cursor: pointer;
}

/*------------------------------------*\
 # 底部操作项文本颜色
 # 描述：设置底部操作菜单项的文本颜色。
\*------------------------------------*/
.bottomBox .el-menu-item {
  color: var(--primary-text-color);
}

/*------------------------------------*\
 # 菜单边框
 # 描述：移除 Element Plus 菜单的右侧边框。
\*------------------------------------*/
.el-menu {
  border-right: 0;
}

/*------------------------------------*\
 # Element Plus 下拉菜单项悬停/焦点样式覆盖
 # 描述：调整 Element Plus 下拉菜单项在悬停或聚焦时的背景颜色。
\*------------------------------------*/
:deep(.el-dropdown-menu__item:not(.is-disabled):focus),
:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--el-dropdown-menu-item-hover);
}
</style>
