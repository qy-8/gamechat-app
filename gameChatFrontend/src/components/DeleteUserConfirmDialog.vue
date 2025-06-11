<script setup>
import BaseDialog from './common/BaseDialog.vue'
import { useUserStore } from '../stores'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import { deleteUser } from '../api/user'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const userStore = useUserStore()

const logout = async () => {
  try {
    const response = deleteUser()
  } catch (error) {
    console.error(error)
  }
  emit('update:visible', false)
  ElMessage.success('您已删除账户')
  router.push('/auth')
}
</script>

<template>
  <div>
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="delete-title">
          <el-icon class="danger-highlight"><WarnTriangleFilled /></el-icon>
          <span>确认永久删除用户</span>
        </div>
      </template>
      <div class="content">
        您确定要 <span class="danger-highlight">永久删除</span> 当前用户
        <span>{{ userStore.userInfo.username }}</span> 吗？
        此操作将会移除该用户的所有资料（包括群聊，好友，聊天信息等），且<span
          class="danger-highlight"
          >资料一旦删除将无法复原</span
        >。 请谨慎操作。
      </div>
      <template #footer>
        <el-button type="primary" @click="emit('update:visible', false)"
          >取消</el-button
        >
        <el-button type="danger" @click="logout">永久删除</el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
.el-button {
  width: 100px;
  margin: 20px 20px 0 10px;
}

.delete-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  .el-icon {
    margin: 2px 6px 0 0;
  }
}

.content {
  padding: 0 30px;
}

.danger-highlight {
  color: var(--el-color-danger);
}
</style>
