<script setup>
/**
 * @file CreateGroupDialog.vue
 * @description 用于创建新群组的对话框组件。
 * @component CreateGroupDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 */
import { ref, reactive } from 'vue'
import { createGroup } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { useGroupStore } from '../stores'
import { ElMessage } from 'element-plus' // 确保导入 ElMessage

const groupStore = useGroupStore()
const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])

// 群组表单数据
const form = reactive({
  name: '',
  description: ''
})
// 表单引用，用于触发表单验证
const createGroupFormRef = ref(null)

// 创建群组表单验证规则
const createGroupRules = reactive({
  name: [
    { required: true, message: '请输入群组名称', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{3,10}$/,
      message: '群组名称需为3-10位字符',
      trigger: 'blur'
    }
  ],
  description: [
    { required: true, message: '请输入简短的群组描述', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{2,15}$/,
      message: '群组描述需为3-12位字符',
      trigger: 'blur'
    }
  ]
})

/**
 * 提交表单创建群组。
 * 验证表单后，调用 API 创建群组，并处理成功/失败消息。
 */
const onSubmit = () => {
  createGroupFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await createGroup(form)
      ElMessage.success(response.message)
      emit('update:visible', false) // 关闭对话框
      groupStore.addNewGroup(response.data) // 将新创建的群组添加到 store
    } catch (error) {
      ElMessage.closeAll()
      ElMessage.error('群组名已存在')
      console.error(error)
    }
  })
}
</script>

<template>
  <div class="create-group-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="title">创建群聊</div>
      </template>

      <!-- 群组创建表单 -->
      <el-form
        :model="form"
        ref="createGroupFormRef"
        :rules="createGroupRules"
        hide-required-asterisk
      >
        <el-form-item label="群聊名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="群聊描述" prop="description">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认创建 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>
