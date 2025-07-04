<script setup>
/**
 * @file FriendRequestListDialog.vue
 * @description 显示用户收到的好友请求列表的对话框组件。
 * @component FriendRequestListDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
import BaseDialog from './common/BaseDialog.vue'
import { handleFriendRequest } from '../api/friend'
import { ElMessage } from 'element-plus'
import { useFriendStore } from '../stores'
import { storeToRefs } from 'pinia'
import RequestCard from './common/RequestCard.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const friendStore = useFriendStore()
const { friendRequestList } = storeToRefs(friendStore)

/**
 * 处理好友请求（接受或拒绝）。
 * @param {string} requestId - 好友请求的ID。
 * @param {'accept' | 'decline'} action - 执行的操作 ('accept' 或 'decline')。
 */
const handleRequestAction = async (requestId, action) => {
  if (requestId) {
    try {
      const response = await handleFriendRequest({ requestId, action })
      ElMessage.success(response.message)
      if (action === 'accept') {
        friendStore.addNewFriend(response.data) // 如果接受，将新好友添加到 store
      }
      friendStore.getIncomingRequests() // 刷新请求列表
    } catch (error) {
      console.error('处理好友请求失败:', error)
    }
  }
}
</script>

<template>
  <div>
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <div class="request-wrapper">
        <el-scrollbar>
          <RequestCard
            v-if="friendRequestList.length > 0"
            v-for="item in friendRequestList"
            :key="item._id"
            :avatar="item.requester.avatar"
            :name="item.requester.username"
            :timestamp="item.requestedAt"
            @accept="handleRequestAction(item._id, 'accept')"
            @decline="handleRequestAction(item._id, 'decline')"
          />
          <el-empty image="" description="好友请求列表为空" v-else />
        </el-scrollbar>
      </div>

      <template #header>
        <div class="title">我收到的好友请求</div>
      </template>

      <template #footer>
        <el-button type="primary" @click="emit('update:visible')">
          关闭
        </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 请求卡片容器样式
 # 描述：定义包裹好友请求卡片的容器宽度和最小高度。
\*------------------------------------*/
.request-wrapper {
  width: 86%;
  min-height: 300px;
}

/*------------------------------------*\
 # 滚动条样式
 # 描述：设置滚动区域的高度。
\*------------------------------------*/
.el-scrollbar {
  height: 320px;
}
</style>
