<script setup>
import { ref, reactive } from 'vue'
import { createChannel } from '@/api/group.js'
import BaseDialog from './common/BaseDialog.vue'
import { useGroupStore } from '@/stores'
import { getChannelList } from '../api/group'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'created'])

const form = reactive({
  name: ''
})
const createChannelFormRef = ref(null)
const groupStore = useGroupStore()

// 创建群聊表格规则
const createChannelRules = reactive({
  name: [
    { required: true, message: '请输入频道名称', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{3,15}$/,
      message: '频道名称需为3-15位字符',
      trigger: 'blur'
    }
  ]
})

const onSubmit = () => {
  // TODO: loading
  createChannelFormRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('验证失败')
      return
    }
    try {
      const response = await createChannel({
        ...form,
        groupId: groupStore.activeGroup._id
      })
      ElMessage.success(response.message)
      emit('update:visible', false)
      emit('created')
    } catch (error) {
      // ElMessage.closeAll()
      ElMessage.error('频道名已存在')
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

<style lang="scss" scoped></style>
