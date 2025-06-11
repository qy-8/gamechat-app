<script setup>
import { ref, reactive, onMounted } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { useCountdown } from '@/composables/useCountdown'
import { getCode } from '../services/authService'
import { fetchCaptcha, resetPassword } from '../api/auth'
import { createConfirmPasswordValidator } from '../utils/pwdValidators'
import { ElMessage } from 'element-plus'

const { timeLeft, isCounting, start } = useCountdown()
const props = defineProps({
  visible: Boolean,
  phoneNum: String
})
const emit = defineEmits(['update:visible'])
const captchaCode = ref('')
const resetPwdFormRef = ref(null)
const sendSmsCode = () => {
  if (form.captcha) {
    start()
    getCode({ phoneNumber: props.phoneNum, captcha: form.captcha })
  } else {
    ElMessage.warning('请先填写图片验证码')
  }
}

const form = reactive({
  captcha: ''
})

const resetPwdForm = reactive({
  code: '',
  newPwd: '',
  confirmPwd: ''
})
const updateInfoFormRef = ref(null)

// 注册表单校验规则
const CaptchaFormRules = reactive({
  captcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9]{5}$/,
      message: '请输入正确的图形验证码',
      trigger: 'blur'
    }
  ]
})

const resetPwdFormRules = reactive({
  code: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    {
      pattern: /^[0-9]{6}$/,
      message: '请输入正确的短信验证码',
      trigger: 'blur'
    }
  ],
  newPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[\S]{6,12}$/,
      message: '密码需为6-12位非空字符',
      trigger: 'blur'
    }
  ],
  confirmPwd: [
    {
      validator: createConfirmPasswordValidator(() => resetPwdForm.newPwd),
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

// 点击图片更新图片验证码
const getNewCaptcha = async () => {
  captcha()
}

onMounted(() => {
  captcha()
})

const onSubmit = () => {
  // TODO: loading
  resetPwdFormRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('验证失败')
      return
    }
    try {
      const response = await resetPassword({
        newPwd: resetPwdForm.newPwd,
        code: resetPwdForm.code,
        phoneNumber: props.phoneNum
      })
      ElMessage.success(response.message)
      emit('update:visible', false)
    } catch (error) {
      ElMessage.closeAll()
      ElMessage.error(error.message)
      console.error(error)
    }
  })
}
</script>

<template>
  <div class="reset-pwd-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="title">修改密码</div>
      </template>
      <div class="reset-pwd-box">
        <el-form
          :model="form"
          ref="updateInfoFormRef"
          :rules="CaptchaFormRules"
          hide-required-asterisk
        >
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
          <div class="send-code-box">
            <div class="send-code-text">
              系统将发送验证码到 <span>{{ phoneNum }}</span> 中，请确认号码
            </div>
          </div>
        </el-form>
        <el-form
          :model="resetPwdForm"
          ref="resetPwdFormRef"
          :rules="resetPwdFormRules"
          label-width="82px"
          label-position="left"
          hide-required-asterisk
        >
          <div class="code-box">
            <el-form-item label="短信验证码" prop="code">
              <el-input
                v-model="resetPwdForm.code"
                placeholder="请输入短信验证码"
              ></el-input>
            </el-form-item>
            <el-button :disabled="isCounting" @click="sendSmsCode">{{
              isCounting ? `${timeLeft}s 后重试` : '获取验证码'
            }}</el-button>
          </div>
          <el-form-item label="新密码" prop="newPwd">
            <el-input
              v-model="resetPwdForm.newPwd"
              type="password"
              placeholder="请输入密码，6-12个字符，区分大小写"
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPwd">
            <el-input
              v-model="resetPwdForm.confirmPwd"
              type="password"
              placeholder="请再次输入密码"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认重设密码 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
@use '.././views/auth/auth.scss' as *;

.reset-pwd-dialog-container {
  display: flex;
  flex-direction: column;
}

.send-code-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  margin: 10px 0;
  margin-bottom: 30px;
  border-top: 1px solid var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-text-color-primary);

  span {
    color: var(--el-text-color-primary);
  }
}
</style>
