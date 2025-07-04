<script setup>
/**
 * @file LogoutDialog.vue
 * @description 确认用户退出登录的对话框组件。
 * @component LogoutDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
import BaseDialog from './common/BaseDialog.vue'
import { useUserStore } from '../stores'
import router from '@/router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const userStore = useUserStore()

/**
 * 执行用户退出登录操作。
 * 调用 user store 的 logout 方法，显示提示信息，关闭对话框，并重定向到认证页面。
 */
const logout = () => {
  userStore.logout() // 执行用户登出逻辑
  emit('update:visible', false) // 关闭对话框
  ElMessage.success('您已退出登陆') // 显示成功消息
  router.push('/auth') // 跳转到认证页面
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
/*------------------------------------*\
 # 按钮通用样式
 # 描述：设置对话框底部按钮的宽度和外边距。
\*------------------------------------*/
.el-button {
  width: 100px;
  margin: 20px 20px 0 10px;
}

/*------------------------------------*\
 # 退出登录按钮悬停样式
 # 描述：定义退出登录按钮在鼠标悬停时的背景和边框颜色。
\*------------------------------------*/
.log-out-btn:hover {
  background-color: transparent;
  border-color: var(--el-text-color-primary);
}
</style>
