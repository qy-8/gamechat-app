<script setup>
/**
 * @file GroupRequestListDialog.vue
 * @description 显示用户收到的群组邀请列表的对话框组件。
 * @component GroupRequestListDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
import BaseDialog from './common/BaseDialog.vue'
import UserBadge from './common/UserBadge.vue'
import { useGroupStore } from '../stores'
import { storeToRefs } from 'pinia'
import RequestCard from './common/RequestCard.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const groupStore = useGroupStore()
const { groupInvitations } = storeToRefs(groupStore)

/**
 * 处理群组邀请（接受或拒绝）。
 * @param {string} groupId - 邀请所属的群组ID。
 * @param {'accept' | 'decline'} action - 执行的操作 ('accept' 或 'decline')。
 * @param {string} invitationId - 邀请的ID。
 */
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
                size="20"
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
/*------------------------------------*\
 # 请求卡片容器样式
 # 描述：定义包裹群组邀请卡片的容器宽度和最小高度。
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

/*------------------------------------*\
 # 邀请者信息容器样式
 # 描述：定义显示邀请者用户徽章和文本的布局。
\*------------------------------------*/
.inviter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 6px 6px;
}

/*------------------------------------*\
 # 邀请者用户信息样式
 # 描述：调整邀请者用户徽章的左右间距。
\*------------------------------------*/
.user-info {
  margin: 0 6px;
}
</style>
