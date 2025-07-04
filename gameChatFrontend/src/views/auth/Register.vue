<script setup>
/**
 * @file views/auth/Register.vue
 * @description 用户注册组件，提供手机号、图形验证码、短信验证码、用户名和密码注册功能。
 * 包含验证码获取、注册逻辑和表单重置。
 * @component RegisterPage
 */
import { reactive, ref, onMounted } from 'vue'
import { fetchCaptcha, sendSmsCode, registerUser } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { useCountdown } from '@/composables/useCountdown'
import { createConfirmPasswordValidator } from '../../utils/pwdValidators'

// 控制表单提交后的loading状态
const captchaCode = ref('')
// 表单数据模型
const form = reactive({
  phoneNumber: '',
  captcha: '', // 图形验证码
  code: '', // 短信验证码
  username: '',
  password: '',
  rePassword: '' // 确认密码
})
const loading = ref(false)
const registerFormRef = ref(null)
const { timeLeft, isCounting, start } = useCountdown()

// 注册表单的校验规则
const rules = reactive({
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
  ],
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
      pattern: /^[\S]{6,12}$/, // 6-12位非空字符
      message: '密码需为6-12位非空字符',
      trigger: 'blur'
    }
  ],
  rePassword: [
    {
      // 使用自定义验证器对比密码
      validator: createConfirmPasswordValidator(() => form.password),
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
    const response = await fetchCaptcha() // 调用 API 获取图形验证码
    captchaCode.value = response.data // 更新验证码图片数据
  } catch (error) {
    console.error('获取验证码失败:', error) // 捕获异常并打印错误
    ElMessage.error('获取图形验证码失败，请重试。') // 提供用户反馈
  }
}

// 在组件挂载到 DOM 后获取图形验证码
onMounted(() => {
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
  if (form.phoneNumber === '') {
    ElMessage.error('请填写手机号码')
    return
  }
  if (form.captcha === '') {
    ElMessage.error('请填写图形验证码')
    return
  }
  try {
    start() // 启动倒计时
    await sendSmsCode(form) // 调用 API 发送短信验证码
  } catch (error) {
    console.error('获取短信验证码失败:', error)
    captcha() // 刷新图形验证码
  }
}

/**
 * @function onSubmit
 * @description 执行用户注册操作。
 * 验证表单后，调用 API 进行注册，并处理注册成功/失败的逻辑。
 * 成功则提示成功并重置表单。
 * @returns {Promise<void>}
 */
const onSubmit = () => {
  loading.value = true // 开启 loading
  // 触发表单验证
  registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      loading.value = false // 关闭 loading
      return
    }
    try {
      const response = await registerUser(form)
      ElMessage({ message: '注册成功', type: 'success' })
      resetForm(registerFormRef)
    } catch (error) {
      console.error('提交失败，结果：', error)
      captcha() // 注册失败时刷新图形验证码
    } finally {
      loading.value = false // 关闭 loading
    }
  })
}

/**
 * @function resetForm
 * @description 重置注册表单的所有字段和验证状态。
 * @param {Ref<import('element-plus').ElFormInstance|null>} registerFormRef - 引用
 * @returns {void}
 */
const resetForm = (registerFormRef) => {
  if (!registerFormRef.value) return
  registerFormRef.value.resetFields() // 调用 Element Plus 表单的重置方法
}
</script>

<template>
  <div class="section content">
    <h2>注册账户</h2>

    <el-form
      v-loading="loading"
      ref="registerFormRef"
      :model="form"
      status-icon
      :rules="rules"
      hide-required-asterisk
      label-width="auto"
      label-position="left"
    >
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input
          v-model="form.phoneNumber"
          placeholder="请输入手机号码"
        ></el-input>
      </el-form-item>
      <div class="code-box">
        <el-form-item label="图形验证码" prop="captcha">
          <el-input
            v-model="form.captcha"
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
            v-model="form.code"
            placeholder="请输入短信验证码"
          ></el-input>
        </el-form-item>
        <el-button :disabled="isCounting" @click="getCode">{{
          isCounting ? `${timeLeft}s 后重试` : '获取验证码'
        }}</el-button>
      </div>
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名，长度3-15个字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码，6-12个字符，区分大小写"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePassword">
        <el-input
          v-model="form.rePassword"
          type="password"
          placeholder="请再次输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div class="form-button-container">
          <el-button :disabled="loading" @click="onSubmit">注册</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './auth.scss' as *; // 导入认证页面的共享样式
</style>
