<script setup>
import { ref, reactive } from 'vue'
import { createChannel } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { useUserStore } from '../stores'
import { updateUserInfo } from '../api/user'

const props = defineProps({
  visible: Boolean,
  phoneNum: String
})
const emit = defineEmits(['update:visible', 'created'])
const userStore = useUserStore()
const form = reactive({
  username: userStore.userInfo.username,
  phoneNumber: props.phoneNum
})
const formRef = ref(null)

// 创建群聊表格规则
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
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的中国大陆手机号',
      trigger: 'blur'
    }
  ]
})

const onSubmit = () => {
  // TODO: loading
  formRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('验证失败')
      return
    }
    try {
      const response = await updateUserInfo(form)
      ElMessage.success(response.message)
      emit('update:visible', false)
    } catch (error) {
      // ElMessage.closeAll()
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

<style lang="scss" scoped></style>
