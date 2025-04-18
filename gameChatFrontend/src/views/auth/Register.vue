<script setup>
import { reactive, ref } from 'vue'
import { fetchCaptcha, sendSmsCode, registerUser } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { useCountdown } from '@/composables/useCountdown'

// 控制表单提交后的loading状态
const captchaCode = ref('')
const form = reactive({
  phoneNumber: '',
  captcha: '',
  code: '',
  username: '',
  password: '',
  rePassword: ''
})
const loading = ref(false)
const registerFormRef = ref(null)
const { timeLeft, isCounting, start } = useCountdown()

// 自定义校验表单中的确认密码 rePassword
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请在此输入密码'))
  } else if (value !== form.password) {
    console.log(form.password, value)
    callback(new Error('确认密码与密码不一致'))
  } else {
    callback() // 校验通过
  }
}

// 注册表单校验规则
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
      pattern: /^[\S]{6,12}$/,
      message: '密码需为6-12位非空字符',
      trigger: 'blur'
    }
  ],
  rePassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
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
  try {
    start()
    const response = await sendSmsCode(form)
    console.log('验证码已发送（开发阶段打印）')
  } catch (error) {
    console.error('获取短信验证码失败:', error)
  }
}

// 点击提交按钮后提交表单
const onSubmit = () => {
  loading.value = true // 开启 loading
  registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      loading.value = false // 关闭 loading
      console.log('验证失败')
      // TODO: login page
      return
    }
    try {
      const response = await registerUser(form)
      ElMessage({ message: '注册成功', type: 'success' })
      console.log('注册成功')
      resetForm(registerFormRef)
    } catch (error) {
      console.error('提交失败，结果：', error)
    } finally {
      loading.value = false // 关闭 loading
    }
  })
}
// TODO: 成功后自动跳转到登陆页/自动调用登陆接口，
// 限制短信验证码发送频率，
// 防 XSS（跨站脚本攻击）后端必须过滤字段（尤其是 username、签名等文本字段）

// 重置表单
const resetForm = (registerFormRef) => {
  if (!registerFormRef.value) return
  registerFormRef.value.resetFields()
}
</script>

<template>
  <!-- 注册 -->
  <el-row class="container">
    <el-col :span="9">
      <div class="side-info content">
        <h2>你的游戏之旅，从这里开始！</h2>
        <p class="welcome-text">
          🤝 找到游戏搭子，一起开黑冒险！ <br />🛠️ 与游戏开发者 & Mod
          创作者互动！ <br />💬 加入专属社区，分享你的创意和想法！
        </p>
        <el-button @click="$emit('switch')">登陆</el-button>
      </div>
    </el-col>
    <el-col :span="15">
      <div class="section content">
        <h2>注册账户</h2>
        <!-- <p>使用电话号码注册</p> -->

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
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
@import './auth.scss';
</style>
