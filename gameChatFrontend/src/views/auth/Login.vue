<script setup>
/**
 * @file views/auth/Login.vue
 * @description 用户登录组件，提供手机号+验证码登录方式。
 * 包含图形验证码获取、短信验证码发送和登录逻辑。
 * @component LoginPage
 */
import { reactive, ref, onMounted } from 'vue'
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

// 使用手机号+图形验证码+短信验证码登陆表格数据
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

/**
 * @function captcha
 * @description 获取新的图形验证码图片。
 * 调用 API 获取验证码图片，并更新 `captchaCode`。
 * @returns {Promise<void>}
 */
const captcha = async () => {
  try {
    const response = await fetchCaptcha()
    captchaCode.value = response.data
  } catch (error) {
    console.error('获取验证码失败:', error) // 捕获异常并打印错误
  }
}

onMounted(() => {
  // 在组件挂载到 DOM 后获取图形验证码
  captcha()
})
/**
 * @function getNewCaptcha
 * @description 点击图形验证码图片时，获取并更新新的图片验证码。
 * @returns {Promise<void>}
 */
const getNewCaptcha = async () => {
  captcha()
}

/**
 * @function getCode
 * @description 点击“获取验证码”按钮时，发送短信验证码。
 * 在发送前会校验手机号码和图形验证码。
 * @returns {Promise<void>}
 */
const getCode = async () => {
  // 校验手机号码和图形验证码是否填写
  if (phoneForm.phoneNumber === '') {
    ElMessage.error('请填写手机号码')
    return
  }
  if (phoneForm.captcha === '') {
    ElMessage.error('请填写图形验证码')
    return
  }
  try {
    start() // 启动倒计时
    await sendSmsCode(phoneForm) // 调用 API 发送短信验证码
  } catch (error) {
    console.error('获取短信验证码失败:', error)
    captcha() // 刷新图形验证码
  }
}

/**
 * @function login
 * @description 执行用户登录操作。
 * 验证表单后，调用 API 进行登录，并处理登录成功/失败的逻辑。
 * 成功则存储 token，更新 Store，并跳转到聊天页面。
 * @returns {Promise<void>}
 */
const login = async () => {
  // 触发表单验证
  userFormRef.value.validate(async (valid) => {
    if (!valid) {
      loading.value = false // 关闭 loading
      return
    }
    try {
      // 调用 API 进行手机号+验证码登录
      const result = await loginByPhone(phoneForm)
      const token = result.data
      localStorage.setItem('token', token)
      const userStore = useUserStore()
      userStore.setToken(token)
      ElMessage({ message: result.message, type: 'success' })
      router.push('/chat')
    } catch (error) {
      console.error(error)
      captcha()
    }
  })
}
</script>

<template>
  <div class="section content">
    <h2>用户登陆</h2>
    <!-- 登陆表单 开始 -->
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
    <!-- 登陆表单 结束 -->
  </div>
</template>

<style lang="scss" scoped>
@use './auth.scss' as *; // 导入认证页面的共享样式
</style>
