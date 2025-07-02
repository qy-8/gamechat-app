<script setup>
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

const handleRequestAction = async (requestId, action) => {
  if (requestId) {
    try {
      const response = await handleFriendRequest({ requestId, action })
      ElMessage.success(response.message)
      if (action === 'accept') {
        friendStore.addNewFriend(response.data)
      }
      friendStore.getIncomingRequests()
    } catch (error) {
      console.error(error)
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
.request-wrapper {
  width: 86%;
  min-height: 300px;
}

.el-scrollbar {
  height: 320px;
}
</style>
