<script setup>
/**
 * @file ResetPwdDialog.vue
 * @description 用于用户重置密码的对话框组件，包含图形验证码、短信验证码和新密码设置。
 * @component ResetPwdDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @property {string} phoneNum - 用户的手机号码，用于接收短信验证码。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
import { ref, reactive, onMounted } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { useCountdown } from '@/composables/useCountdown' // 倒计时 Composable
import { getCode } from '../services/authService' // 获取短信验证码 API
import { fetchCaptcha, resetPassword } from '../api/auth' // 获取图形验证码和重置密码 API
import { createConfirmPasswordValidator } from '../utils/pwdValidators' // 密码校验
import { ElMessage } from 'element-plus' // Element Plus 消息提示

const { timeLeft, isCounting, start } = useCountdown()
const props = defineProps({
  visible: Boolean,
  phoneNum: String
})
const emit = defineEmits(['update:visible'])
const captchaCode = ref('')
const resetPwdFormRef = ref(null)

/**
 * 发送短信验证码。
 * 检查图形验证码是否填写，然后触发倒计时并发送短信。
 */
const sendSmsCode = () => {
  if (form.captcha) {
    start() // 开始倒计时
    getCode({ phoneNumber: props.phoneNum, captcha: form.captcha }) // 发送短信验证码
  } else {
    ElMessage.warning('请先填写图片验证码')
  }
}

// 图形验证码表单数据
const form = reactive({
  captcha: ''
})

// 重置密码表单数据
const resetPwdForm = reactive({
  code: '', // 短信验证码
  newPwd: '', // 新密码
  confirmPwd: '' // 确认新密码
})
// 图形验证码表单的引用（这里命名与 resetPwdFormRef 冲突，实际模板中对应 CaptchaFormRules 的表单）
const updateInfoFormRef = ref(null)

// 图形验证码表单的校验规则
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

// 重置密码表单的校验规则
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
      pattern: /^[\S]{6,12}$/, // 6-12位非空字符
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

/**
 * 获取图形验证码图片。
 * 调用 API 获取新的图形验证码图片URL。
 */
const captcha = async () => {
  try {
    const response = await fetchCaptcha()
    captchaCode.value = response.data
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取图形验证码失败，请重试。')
  }
}

/**
 * 点击图形验证码图片时，获取新的验证码。
 */
const getNewCaptcha = async () => {
  captcha()
}

// 组件挂载时获取初始图形验证码
onMounted(() => {
  captcha()
})

/**
 * 提交重置密码表单。
 * 验证表单后，调用 API 重置密码，并处理成功/失败消息。
 */
const onSubmit = () => {
  resetPwdFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await resetPassword({
        newPwd: resetPwdForm.newPwd,
        code: resetPwdForm.code,
        phoneNumber: props.phoneNum
      })
      ElMessage.success(response.message)
      emit('update:visible', false) // 关闭对话框
    } catch (error) {
      ElMessage.closeAll()
      ElMessage.error(error.message)
      console.error(error)
      captcha() // 重置密码失败时刷新图形验证码
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
        <!-- 图形验证码表单 -->
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

        <!-- 重置密码表单 开始 -->
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
        <!-- 重置密码表单 结束 -->
      </div>

      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认重设密码 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
@use '.././views/auth/auth.scss' as *; // 导入认证页面的共享样式

/*------------------------------------*\
 # 密码重置对话框容器
 # 描述：定义重置密码对话框的整体布局为垂直方向。
\*------------------------------------*/
.reset-pwd-dialog-container {
  display: flex;
  flex-direction: column;
}

/*------------------------------------*\
 # 短信发送提示框
 # 描述：定义发送短信验证码提示文本的样式和边框。
\*------------------------------------*/
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
