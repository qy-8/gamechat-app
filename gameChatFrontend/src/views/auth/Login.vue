<script setup>
import { reactive, ref } from 'vue'
import { fetchCaptcha, sendSmsCode } from '@/api/auth'
import { useCountdown } from '@/composables/useCountdown'
import { loginByPhone } from '../../api/auth'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/modules/user'
import router from '../../router'

const captchaCode = ref('')
const loading = ref(false)
const userFormRef = ref(null)
const { timeLeft, isCounting, start } = useCountdown()

// 使用用户名+密码登陆表格
const userForm = reactive({
  username: '',
  password: ''
})

// 使用手机号+图形验证码+短信验证码登陆表格
const phoneForm = reactive({
  phoneNumber: '',
  captcha: '',
  code: ''
})

// 使用用户名+密码登陆表格的规则
const userFormRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{3,15}$/,
      message: '用户名需为3-15位字母或数字',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[\S]{6,12}$/,
      message: '密码需为6-12位字符',
      trigger: 'blur'
    }
  ]
})

// 使用手机号+图形验证码+短信验证码登陆表格规则
const phoneFormRules = reactive({
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的中国大陆手机号',
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9]{5}$/,
      message: '请输入正确的图形验证码',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    {
      pattern: /^[0-9]{6}$/,
      message: '请输入正确的短信验证码',
      trigger: 'blur'
    }
  ]
})

// 获取图形验证码
const captcha = async () => {
  try {
    const response = await fetchCaptcha()
    captchaCode.value = response.data
  } catch (error) {
    console.error('获取验证码失败:', error) // 捕获异常并打印错误
  }
}

captcha()

// 点击图片更新图片验证码
const getNewCaptcha = async () => {
  captcha()
}

// 点击获取验证码按钮获取短信验证码 - 测试阶段短信验证码在后端Terminal内模拟发送
const getCode = async () => {
  if (phoneForm.phoneNumber === '') {
    ElMessage.error('请填写手机号码')
    return
  }
  if (phoneForm.captcha === '') {
    ElMessage.error('请填写图形验证码')
    return
  }
  try {
    start()
    const response = await sendSmsCode(phoneForm)
  } catch (error) {
    console.error('获取短信验证码失败:', error)
  }
}

const login = async () => {
  userFormRef.value.validate(async (valid) => {
    if (!valid) {
      loading.value = false // 关闭 loading
      // TODO: login page
      return
    }
    try {
      const result = await loginByPhone(phoneForm)
      const token = result.data
      localStorage.setItem('token', token)
      const userStore = useUserStore()
      userStore.setToken(token)
      ElMessage({ message: result.message, type: 'success' })
      router.push('/chat')
    } catch (error) {
      console.error(error)
    }
  })
}
</script>

<template>
  <div class="section content">
    <h2>用户登陆</h2>
    <el-form
      v-loading="loading"
      ref="userFormRef"
      :model="phoneForm"
      status-icon
      :rules="phoneFormRules"
      hide-required-asterisk
      label-width="auto"
      label-position="left"
    >
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input
          v-model="phoneForm.phoneNumber"
          placeholder="请输入手机号码"
        ></el-input>
      </el-form-item>
      <div class="code-box">
        <el-form-item label="图形验证码" prop="captcha">
          <el-input
            v-model="phoneForm.captcha"
            placeholder="点击验证码更换图片"
          ></el-input>
        </el-form-item>
        <div class="img-code" @click="getNewCaptcha">
          <img :src="captchaCode" alt="验证码" />
        </div>
      </div>
      <div class="code-box">
        <el-form-item label="短信验证码" prop="code">
          <el-input
            v-model="phoneForm.code"
            placeholder="请输入短信验证码"
          ></el-input>
        </el-form-item>
        <el-button :disabled="isCounting" @click="getCode">{{
          isCounting ? `${timeLeft}s 后重试` : '获取验证码'
        }}</el-button>
      </div>
      <el-form-item>
        <div class="form-button-container">
          <el-button :disabled="loading" @click="login">登陆</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './auth.scss' as *;
</style>
