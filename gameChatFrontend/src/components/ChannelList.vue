<script setup>
/**
 * @file GroupPanel.vue
 * @description 群组面板组件，显示群组信息、频道列表，并提供群组管理功能。
 * @component GroupPanel
 */
import { ArrowDown } from '@element-plus/icons-vue'
import { ref } from 'vue'
import CreateChannelDialog from './CreateChannelDialog.vue'
import { useGroupStore, useChannelStore, useChatStore } from '@/stores'
import { DeleteFilled } from '@element-plus/icons-vue'
import UploadGroupAvatarDialog from './UploadGroupAvatarDialog.vue'
import { useDraggableWidth } from '../composables/useDraggableWidth'
import { storeToRefs } from 'pinia'
import { getSocket } from '../services/socketService'
import UpdateGroupInfo from './UpdateGroupInfo.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const socket = getSocket()
const activeIndex = ref('1')
const groupInfo = ref(null)
const channelStore = useChannelStore()
const showCreateChannelDialog = ref(false)
const groupStore = useGroupStore()
const { channelList } = storeToRefs(channelStore)
const showDeleteIcon = ref(false)
const showUploadGroupAvatarDialog = ref(null)
const showUpdateGroupInfo = ref(null)
const loading = ref(false)

const deleteSelectedChannel = async (channelId) => {
  try {
    await channelStore.deleteGroupChannel(channelId)
  } catch (error) {
    console.error('在组件层面捕获到删除失败:', error)
  } finally {
    loading.value = false
    showDeleteIcon.value = false
  }
}

/**
 * 处理群组头像上传成功。
 * @param {string} data - 上传成功后的新头像 URL。
 */
const handleUploadSuccess = (data) => {
  groupStore.activeGroup.avatar = data // 更新当前激活群组的头像
}

// 使用可拖拽宽度 Composable
const { startDragging } = useDraggableWidth(groupInfo, {
  minWidth: 200,
  maxWidth: 500
})

/**
 * 处理频道点击事件，设置当前激活频道并加入对应的 Socket 房间。
 * @param {object} currentChannel - 当前点击的频道对象。
 */
const handleClickChannel = (currentChannel) => {
  channelStore.setActiveChannel(currentChannel)
  const chatStore = useChatStore()
  chatStore.setActiveConversation(currentChannel) // 设置当前会话为激活状态
  socket.emit('join_channel', currentChannel._id) // 加入频道对应的 Socket 房间
}

/**
 * 处理解散群组操作。
 * 弹出确认框，确认后解散当前激活的群组。
 */
const handleDisbandGroup = async () => {
  if (!groupStore.activeGroup) {
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要解散群组 “${groupStore.activeGroup.name}” 吗？此操作将使群组失效，群组成员将无法再访问。`,
      '确认解散群组',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'disband-message-box',
        cancelButtonClass: 'disband-cancel-btn'
      }
    )
    await groupStore.disbandGroup()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div v-loading="loading" class="container">
    <!-- 面板群组信息和菜单显示区域 -->
    <el-menu :default-active="activeIndex" class="panel" ref="groupInfo">
      <el-menu-item class="title-box">
        <div
          class="group-background"
          :style="{ backgroundImage: `url(${groupStore.activeGroup?.avatar})` }"
        >
          <div class="group-title">
            <span>{{ groupStore.activeGroup?.name }}</span>
            <!-- 面板群组菜单 -->

            <el-dropdown
              placement="bottom-end"
              dropdown-class="custom-dropdown"
              size="large"
            >
              <el-icon class="has-active-scale-effect"><ArrowDown /></el-icon>
              <template #dropdown>
                <el-dropdown-menu class="group-setting-dropdown">
                  <el-dropdown-item
                    @click="showCreateChannelDialog = !showCreateChannelDialog"
                    >添加群组频道</el-dropdown-item
                  >
                  <el-dropdown-item
                    @click="showDeleteIcon = true"
                    v-if="!showDeleteIcon"
                    >删除群组频道</el-dropdown-item
                  >
                  <el-dropdown-item @click="showDeleteIcon = false" v-else
                    >取消删除频道</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="showUploadGroupAvatarDialog = true"
                    >更换群组头像</el-dropdown-item
                  >
                  <el-dropdown-item @click="showUpdateGroupInfo = true"
                    >修改群组信息</el-dropdown-item
                  >
                  <el-dropdown-item divided @click="handleDisbandGroup"
                    >解散群组</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-menu-item>
      <!-- 群组频道 -->
      <el-menu-item
        v-for="item in channelList"
        :key="item._id"
        :index="item._id"
        class="panel-item"
        @click="handleClickChannel(item)"
        ><span>{{ item.name }}</span>
        <div class="new-announcements" v-if="item.unreadCount > 0">
          {{ item.unreadCount }}
        </div>
        <el-icon
          class="deleteIcon has-active-scale-effect"
          @click="deleteSelectedChannel(item._id)"
          v-if="showDeleteIcon"
          ><DeleteFilled
        /></el-icon>
      </el-menu-item>
    </el-menu>
    <div class="resize-bar" @mousedown="startDragging"></div>
  </div>
  <!-- 菜单选项弹框 -->
  <CreateChannelDialog
    v-model:visible="showCreateChannelDialog"
    v-if="showCreateChannelDialog"
    @created="getChannels"
  ></CreateChannelDialog>
  <UploadGroupAvatarDialog
    v-model:visible="showUploadGroupAvatarDialog"
    v-if="showUploadGroupAvatarDialog"
    @upload-success="handleUploadSuccess"
  ></UploadGroupAvatarDialog>
  <UpdateGroupInfo
    v-model:visible="showUpdateGroupInfo"
    v-if="showUpdateGroupInfo"
  ></UpdateGroupInfo>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/chat/_shared-chat-layout.scss' as *;
@use '@/assets/styles/ui-effects.scss' as *;

/*------------------------------------*\
 # 群组背景样式
 # 描述：设置群组标题区域的背景图片和显示效果。
\*------------------------------------*/
.panel .group-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  background-position: center;
  background-size: cover;
  font-size: 20px;
  border-radius: 20px 20px 0 0;
}

/*------------------------------------*\
 # 频道项未读公告/消息数量样式
 # 描述：定义未读消息数量标签的外观。
\*------------------------------------*/
.panel-item .new-announcements {
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

/*------------------------------------*\
 # 新消息提示样式
 # 描述：定义新消息文本的字体样式。
\*------------------------------------*/
.panel-item .new-messages {
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

/*------------------------------------*\
 # 新消息文本颜色
 # 描述：设置新消息文本的主题颜色。
\*------------------------------------*/
.new-messages span {
  color: var(--el-text-color-primary);
}

/*------------------------------------*\
 # 菜单项悬停和激活状态样式
 # 描述：定义菜单项在鼠标悬停和激活时的背景颜色。
\*------------------------------------*/
.container .el-menu-item:hover,
.panel .el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 面板尺寸调整条样式
 # 描述：定义侧边面板拖拽条的外观和交互光标。
\*------------------------------------*/
.resize-bar {
  width: 4px;
  cursor: ew-resize; /* 左右拖拽光标 */
  background-color: transparent;
  transition: background-color 0.2s;
}

/*------------------------------------*\
 # 删除图标样式
 # 描述：定义频道删除图标的尺寸和颜色。
\*------------------------------------*/
.deleteIcon {
  width: 20px;
  height: 20px;
  color: var(--el-text-color-primary);
  margin: 0;
}

/*------------------------------------*\
 # 激活菜单项图标颜色
 # 描述：设置激活状态菜单项内图标的颜色。
\*------------------------------------*/
.el-menu-item.is-active i {
  color: var(--el-text-color-primary);
}

/*------------------------------------*\
 # 标题菜单项内边距调整
 # 描述：移除标题菜单项的默认内边距。
\*------------------------------------*/
.container .el-menu .el-menu-item.title-box {
  padding: 0;
}

/*------------------------------------*\
 # 菜单边框样式
 # 描述：移除 Element Plus 菜单的默认边框。
\*------------------------------------*/
.el-menu {
  border: none;
}

/*------------------------------------*\
 # Element Plus 下拉菜单项悬停样式覆盖
 # 描述：调整下拉菜单项在悬停或聚焦时的背景色。
\*------------------------------------*/
:deep(.el-dropdown-menu__item:not(.is-disabled):focus),
:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--el-dropdown-menu-item-hover);
}
</style>

<style lang="scss">
/*------------------------------------*\
 # 解散群组确认框取消按钮悬停样式
 # 描述：针对解散群组确认框中的取消按钮，移除悬停时的背景色。
\*------------------------------------*/
.disband-message-box .disband-cancel-btn:hover {
  background-color: transparent;
}
</style>
