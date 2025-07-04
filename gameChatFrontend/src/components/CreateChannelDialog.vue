<script setup>
/**
 * @file CreateChannelDialog.vue
 * @description 用于创建新群组频道的对话框组件。
 * @component CreateChannelDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 * @emits created - 当频道成功创建后触发。
 */
import { ref, reactive } from 'vue'
import { createChannel } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { useGroupStore, useChatStore } from '@/stores'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'created'])

// 频道表单数据
const form = reactive({
  name: ''
})
// 表单引用，用于触发表单验证
const createChannelFormRef = ref(null)
const groupStore = useGroupStore()
const chatStore = useChatStore()

// 创建频道表单验证规则
const createChannelRules = reactive({
  name: [
    { required: true, message: '请输入频道名称', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{2,15}$/,
      message: '频道名称需为2-15位字符',
      trigger: 'blur'
    }
  ]
})

/**
 * 提交表单创建频道。
 * 验证表单后，调用 API 创建频道，并处理成功/失败消息。
 */
const onSubmit = () => {
  createChannelFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await createChannel({
        ...form,
        groupId: groupStore.activeGroup._id
      })
      chatStore.getConversations()
      ElMessage.success(response.message)
      emit('update:visible', false) // 关闭对话框
      emit('created') // 通知父组件频道已创建
    } catch (error) {
      console.error(error)
    }
  })
}
</script>

<template>
  <div class="create-channel-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="title">创建频道</div>
      </template>

      <el-form
        :model="form"
        ref="createChannelFormRef"
        :rules="createChannelRules"
        hide-required-asterisk
      >
        <el-form-item label="频道名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认创建 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>
