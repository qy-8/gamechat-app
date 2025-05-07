<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import CreateChannelDialog from './CreateChannelDialog.vue'
import { useGroupStore } from '@/stores'
import { deleteChannel, getChannelList } from '../api/group'
import { DeleteFilled } from '@element-plus/icons-vue'
import { changeGlobalNodesTarget } from 'element-plus/es/utils/index.mjs'

const activeIndex = ref('1')
let isDragging = false
const groupInfo = ref(null)
let startX = 0
let startWidth = 0
const showCreateChannel = ref(false)
const groupStore = useGroupStore()
let channelList = ref(null)
const showDeleteIcon = ref(false)

const handleDragging = (e) => {
  if (!isDragging || !groupInfo.value) return

  const domElement = groupInfo.value.$el
  const deltaX = e.clientX - startX
  let newWidth = startWidth + deltaX
  const minWidth = 200
  const maxWidth = 500
  // 限制新宽度比最小宽度大或比最大宽度小
  newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)

  domElement.style.width = newWidth + 'px'
}

const stopDragging = () => {
  isDragging = false
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', stopDragging)
}

const startDragging = (e) => {
  if (!groupInfo.value) return

  const domElement = groupInfo.value.$el || groupInfo.value
  startX = e.clientX
  startWidth = domElement.offsetWidth
  isDragging = true

  // 监听鼠标移动事件
  document.addEventListener('mousemove', handleDragging)
  // 监听用户松鼠标事件
  document.addEventListener('mouseup', stopDragging)
}

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
})

// TODO: 在删除前检测是否为群主，不然不让删除
const deleteSelectedChannel = async (channelId) => {
  try {
    const response = await deleteChannel(channelId)
    getChannels()
  } catch (error) {
    console.error('获取频道列表失败:', error)
  }
}

watch(
  () => groupStore.activeGroup._id,
  async (newGroup) => {
    if (newGroup) {
      getChannels()
    }
  }
)
</script>
<template>
  <div class="container">
    <el-menu :default-active="activeIndex" class="group-info" ref="groupInfo">
      <el-menu-item class="group-name">
        <div class="group-background">
          <div class="group-title">
            <span>{{ groupStore.activeGroup.name }}</span>
            <el-dropdown
              placement="bottom-end"
              dropdown-class="custom-dropdown"
              size="large"
            >
              <el-icon><ArrowDown /></el-icon>
              <template #dropdown>
                <el-dropdown-menu class="group-setting-dropdown">
                  <el-dropdown-item
                    @click="showCreateChannel = !showCreateChannel"
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
                  <el-dropdown-item divided>更换群组头像</el-dropdown-item>
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
        class="channel-list"
        ><span>{{ item.name }}</span>
        <div class="new-announcements" v-if="!showDeleteIcon">3</div>
        <el-icon
          class="deleteIcon"
          @click="deleteSelectedChannel(item._id)"
          v-if="showDeleteIcon"
          ><DeleteFilled
        /></el-icon>
      </el-menu-item>
      <el-menu-item index="2" class="channel-list"
        ><span>通用</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
      <el-menu-item index="3" class="channel-list"
        ><span>伙伴</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
      <el-menu-item index="4" class="channel-list"
        ><span>mod</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
    </el-menu>
    <div class="resize-bar" @mousedown="startDragging"></div>
  </div>
  <CreateChannelDialog
    v-model:visible="showCreateChannel"
    v-if="showCreateChannel"
    @created="getChannels"
  ></CreateChannelDialog>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  position: relative;
}

.group-info {
  width: 250px;
  padding-top: 2px;
  background-color: var(--el-bg-color-group-list);
}

.group-info .el-menu-item.group-name {
  height: 120px;
  padding: 0 0 20px 0;
  border-bottom: 1px solid;
}

.group-info .group-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  background-image: url('/images/background1.avif');
  background-position: center;
  background-size: cover;
  font-size: 20px;
  border-radius: 20px;
}

.group-background .el-dropdown {
  color: var(--el-text-color-primary);
}

.el-dropdown .el-icon {
  font-size: 20px;
  outline: none;
}

.group-info .el-menu-item {
  color: var(--el-text-color-regular);
}

.group-title {
  width: 100%;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
    to bottom,
    var(--el-bg-color-group-title-box-bgc),
    transparent
  );
  border-radius: 20px 20px 0 0;
  color: var(--el-text-color-primary);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9); //突出文字
}

.group-title .el-icon {
  margin-right: 0px;
}

.group-info .channel-list {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.channel-list .new-announcements {
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

.channel-list .new-messages {
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

.new-messages span {
  color: var(--el-text-color-primary);
}

.container .el-menu-item:hover,
.group-info .el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.container .group-name:hover {
  background-color: transparent;
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
</style>
