<script setup>
/**
 * @file UpdateUserInfoDialog.vue
 * @description 用于更新用户个人信息（用户名和手机号码）的对话框组件。
 * @component UpdateUserInfoDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @property {string} phoneNum - 用户的当前手机号码，用于表单初始化。
 * @emits update:visible - 当对话框可见状态改变时触发。
 * @emits created - (此事件在此组件中未实际触发，可考虑移除或用于未来功能)
 */
import { ref, reactive } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { useUserStore } from '../stores'
import { updateUserInfo } from '../api/user'

const props = defineProps({
  visible: Boolean,
  phoneNum: String
})
const emit = defineEmits(['update:visible', 'created'])
const userStore = useUserStore()
// 表单数据，初始化为当前用户信息
const form = reactive({
  username: userStore.userInfo.username,
  phoneNumber: props.phoneNum
})
// 表单引用，用于触发表单验证
const formRef = ref(null)

// 表单验证规则
const formRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{3,15}$/,
      message: '用户名需为3-15位字母或数字',
      trigger: 'blur'
    }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/, // 中国大陆手机号正则
      message: '请输入正确的中国大陆手机号',
      trigger: 'blur'
    }
  ]
})

/**
 * 提交表单更新用户信息。
 * 验证表单后，调用 API 更新用户信息，并处理成功/失败消息。
 */
const onSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await updateUserInfo(form)
      ElMessage.success(response.message)
      emit('update:visible', false)
    } catch (error) {
      ElMessage.error('更新用户信息失败')
      console.error(error)
    }
  })
}
</script>

<template>
  <div class="update-info-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="title">修改个人信息</div>
      </template>

      <el-form
        :model="form"
        ref="formRef"
        :rules="formRules"
        label-width="84px"
        label-position="left"
        hide-required-asterisk
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="form.phoneNumber"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认更新 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>
