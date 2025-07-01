<script setup>
import BaseDialog from './common/BaseDialog.vue'
import { useUserStore } from '../stores'
import router from '@/router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  emit('update:visible', false)
  ElMessage.success('您已退出登陆')
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
        <div>即将退出登陆</div>
      </template>
      <div class="content">您确定要退出当前的账户吗？</div>
      <template #footer>
        <el-button type="primary" @click="emit('update:visible', false)"
          >取消</el-button
        >
        <el-button @click="logout" class="log-out-btn">退出登陆</el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
.el-button {
  width: 100px;
  margin: 20px 20px 0 10px;
}

.log-out-btn:hover {
  background-color: transparent;
  border-color: var(--el-text-color-primary);
}
</style>
