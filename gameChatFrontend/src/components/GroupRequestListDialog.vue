<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createGroup } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { getFriendRequestList, handleFriendRequest } from '../api/friend'
import UserBadge from './common/UserBadge.vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useGroupStore } from '../stores'
import { storeToRefs } from 'pinia'
import RequestCard from './common/RequestCard.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const groupStore = useGroupStore()
const { groupInvitations } = storeToRefs(groupStore)

const handleRequestAction = (groupId, action, invitationId) => {
  groupStore.handleRequestAction(groupId, action, invitationId)
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
          <div v-for="item in groupInvitations" :key="item._id">
            <div class="inviter">
              <span>用户</span>

              <UserBadge
                :src="item.inviter.avatar"
                :username="item.inviter.username"
                :size="20"
                class="user-info"
              />
              <span>向您发送群组邀请：</span>
            </div>
            <RequestCard
              v-if="groupInvitations.length > 0"
              :avatar="item.group.avatar"
              :name="item.group.name"
              :timestamp="item.createdAt"
              @accept="handleRequestAction(item.group._id, 'accept', item._id)"
              @decline="
                handleRequestAction(item.group._id, 'decline', item._id)
              "
            />

            <el-empty image="" description="群组邀请列表为空" v-else />
          </div>
        </el-scrollbar>
      </div>
      <template #header>
        <div class="title">我收到的群组邀请</div>
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

.inviter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 6px 6px;
}

.user-info {
  margin: 0 6px;
}
</style>
