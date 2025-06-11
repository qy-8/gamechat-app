<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import CreateChannelDialog from './CreateChannelDialog.vue'
import { useGroupStore } from '@/stores'
import { deleteChannel, getChannelList } from '../api/group'
import { DeleteFilled } from '@element-plus/icons-vue'
// import { changeGlobalNodesTarget } from 'element-plus/es/utils/index.mjs'
import UploadGroupAvatarDialog from './UploadGroupAvatarDialog.vue'
import { useDraggableWidth } from '../composables/useDraggableWidth'

const activeIndex = ref('1')
// let isDragging = false
const groupInfo = ref(null)
// let startX = 0
// let startWidth = 0
const showCreateChannelDialog = ref(false)
const groupStore = useGroupStore()
let channelList = ref(null)
const showDeleteIcon = ref(false)
const showUploadGroupAvatarDialog = ref(null)
const groupBackgroundUrl = ref(null)
const loading = ref(false)

const getChannels = async () => {
  try {
    const response = await getChannelList(groupStore.activeGroup._id)
    channelList.value = response.data
  } catch (error) {
    console.error('获取频道列表失败:', error)
  }
}

onMounted(() => {
  getChannels()
  // handleUploadSuccess()
})

// TODO: 在删除前检测是否为群主，不然不让删除
const deleteSelectedChannel = async (channelId) => {
  loading.value = true
  try {
    const response = await deleteChannel(channelId)
    getChannels()
    showDeleteIcon.value = false
  } catch (error) {
    console.error('获取频道列表失败:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => groupStore.activeGroup?._id,
  async (newGroup) => {
    if (newGroup) {
      getChannels()
    }
  }
)

const handleUploadSuccess = (data) => {
  groupStore.activeGroup.avatar = data
}

const { startDragging } = useDraggableWidth(groupInfo, {
  minWidth: 200,
  maxWidth: 500
})
</script>

<template>
  <div v-loading="loading" class="container">
    <el-menu :default-active="activeIndex" class="panel" ref="groupInfo">
      <el-menu-item class="title-box">
        <div
          class="group-background"
          :style="{ backgroundImage: `url(${groupStore.activeGroup?.avatar})` }"
        >
          <div class="group-title">
            <span>{{ groupStore.activeGroup?.name }}</span>
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
                  <el-dropdown-item>修改群组名称</el-dropdown-item>
                  <el-dropdown-item>修改群组描述</el-dropdown-item>
                  <el-dropdown-item divided>解散群组</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-menu-item>
      <el-menu-item
        v-for="item in channelList"
        :key="item._id"
        :index="item._id"
        class="panel-item"
        ><span>{{ item.name }}</span>
        <div class="new-announcements" v-if="!showDeleteIcon">3</div>
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
</template>

<style lang="scss" scoped>
@use '@/assets/styles/chat/_shared-chat-layout.scss' as *;
@use '@/assets/styles/ui-effects.scss' as *;

.panel .group-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  background-image: url('/images/background1.avif');
  background-position: center;
  background-size: cover;
  font-size: 20px;
  border-radius: 20px 20px 0 0;
}

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

.panel-item .new-messages {
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

.new-messages span {
  color: var(--el-text-color-primary);
}

.container .el-menu-item:hover,
.panel .el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.resize-bar {
  width: 4px;
  cursor: ew-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.deleteIcon {
  width: 20px;
  height: 20px;
  color: var(--el-text-color-primary);
  margin: 0;
}

.el-menu-item.is-active i {
  color: var(--el-text-color-primary);
}

.container .el-menu .el-menu-item.title-box {
  padding: 0;
}

.el-menu {
  border: none;
}
</style>
