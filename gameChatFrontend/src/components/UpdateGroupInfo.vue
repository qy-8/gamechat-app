<script setup>
import { ref, reactive } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { useGroupStore } from '../stores'
import { updateGroupInfo } from '../api/group'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'updated'])
const groupStore = useGroupStore()
const form = reactive({
  name: groupStore.activeGroup.name,
  description: groupStore.activeGroup.description
})
const formRef = ref(null)

// 创建群聊表格规则
const formRules = reactive({
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
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      const response = await updateGroupInfo({
        groupId: groupStore.activeGroup._id,
        name: form.name,
        description: form.description
      })
      ElMessage.success(response.message)
      groupStore.updateGroup(form.name, form.description)
      emit('update:visible', false)
    } catch (error) {
      ElMessage.error('更新群组信息失败')
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
        <div class="title">修改群组信息</div>
      </template>

      <el-form
        :model="form"
        ref="formRef"
        :rules="formRules"
        label-width="84px"
        label-position="left"
        hide-required-asterisk
      >
        <el-form-item label="群组名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="群组描述" prop="description">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="onSubmit"> 确认更新 </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped></style>
