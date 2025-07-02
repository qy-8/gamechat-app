<script setup>
import { ref, reactive } from 'vue'
import { createGroup } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { useGroupStore } from '../stores'

const groupStore = useGroupStore()
const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])

const form = reactive({
  name: '',
  description: ''
})
const createGroupFormRef = ref(null)

// 创建群聊表格规则
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

const onSubmit = () => {
  createGroupFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await createGroup(form)
      ElMessage.success(response.message)
      emit('update:visible', false)
      groupStore.addNewGroup(response.data)
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

<style lang="scss" scoped></style>
