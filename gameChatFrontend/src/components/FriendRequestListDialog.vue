<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createGroup } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { getFriendRequestList, handleFriendRequest } from '../api/friend'
import UserAvatar from './common/UserAvatar.vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useFriendStore } from '../stores'
import { storeToRefs } from 'pinia'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'requestHandled'])
const friendStore = useFriendStore()
const { friendRequestList } = storeToRefs(friendStore)

const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  return dayjs(timestamp).fromNow()
}

const handleRequestAction = async (requestId, action) => {
  if (requestId) {
    try {
      const response = await handleFriendRequest({ requestId, action })
      ElMessage.success(response.message)
      emit('requestHandled')
      friendStore.getIncomingRequests()
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="create-group-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <div class="request-wrapper">
        <el-scrollbar>
          <el-card
            shadow="hover"
            v-if="friendRequestList.length > 0"
            v-for="item in friendRequestList"
            :key="item._id"
          >
            <div class="request-container">
              <UserAvatar :src="item.requester.avatar" class="user-avatar" />

              <div class="request-info-container">
                <div class="user-info-container">
                  <div class="username">{{ item.requester.username }}</div>
                  <div class="request-date">
                    {{ formatTimeAgo(item.requestedAt) }}
                  </div>
                </div>
                <div class="option-container">
                  <el-button
                    class="accept"
                    @click="handleRequestAction(item._id, 'accept')"
                    >同意</el-button
                  >
                  <el-button
                    class="decline"
                    @click="handleRequestAction(item._id, 'decline')"
                    >拒绝</el-button
                  >
                </div>
              </div>
            </div>
          </el-card>

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
.el-card {
  margin-bottom: 10px;
}

.request-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.request-info-container {
  width: 76%;
}

.user-info-container {
  display: flex;
  justify-content: space-between;
}

.request-container .user-avatar {
  margin-right: 20px;
}

.username {
  font-weight: bold;
}

.option-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
}

.option-container .el-button {
  width: 46%;
  height: 26px;
}

.option-container .el-button:hover {
  border: 1px solid var(--el-btn-hover-border-color);
}

.accept {
  border: 1px solid var(--el-text-color-primary);
}
</style>
