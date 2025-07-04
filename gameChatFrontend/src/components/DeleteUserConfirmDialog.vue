<script setup>
/**
 * @file DeleteUserDialog.vue
 * @description 确认永久删除用户账户的对话框组件。
 * @component DeleteUserDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
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

/**
 * 执行用户账户的永久删除操作。
 * 删除成功后，显示提示信息，关闭对话框，并重定向到认证页面。
 */
const logout = async () => {
  try {
    await deleteUser()
    ElMessage.success('您已删除账户')
    router.push('/auth') // 重定向到认证页面
  } catch (error) {
    console.error('删除账户失败:', error)
    ElMessage.error('删除账户失败，请稍后再试。')
  } finally {
    emit('update:visible', false)
  }
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
/*------------------------------------*\
 # 按钮通用样式
 # 描述：设置对话框底部按钮的宽度和外边距。
\*------------------------------------*/
.el-button {
  width: 100px;
  margin: 20px 20px 0 10px;
}

/*------------------------------------*\
 # 删除确认标题样式
 # 描述：定义对话框头部标题的布局、字体大小和图标对齐。
\*------------------------------------*/
.delete-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  .el-icon {
    margin: 2px 6px 0 0;
  }
}

/*------------------------------------*\
 # 内容区域样式
 # 描述：设置对话框主体内容的左右内边距。
\*------------------------------------*/
.content {
  padding: 0 30px;
}

/*------------------------------------*\
 # 危险高亮文本样式
 # 描述：定义文本中需要强调的危险性内容的颜色。
\*------------------------------------*/
.danger-highlight {
  color: var(--el-color-danger);
}
</style>
