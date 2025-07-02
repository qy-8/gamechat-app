<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { ElMessage, genFileId } from 'element-plus'
import { uploadGroupAvatar } from '../api/group'
import { useGroupStore } from '@/stores'

const uploadRef = ref(null)
const MAX_FILE_SIZE_MB = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB)
const MAX_FILE_SIZE_BYTES_FRONTEND = MAX_FILE_SIZE_MB * 1024 * 1024
const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'upload-success'])
const imageUrl = ref('') // 存储预览图片的 URL
const hasImage = ref(false) // 控制预览图片的显示
const groupStore = useGroupStore()
const uploading = ref(false)
const uploadImage = ref(null)

const handleExceed = (files) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles() // 清除文件列表，移除旧文件
    const file = files[0] // 获取第一个文件
    file.uid = genFileId() // 生成uid
    uploadRef.value.handleStart(file) // 将新文件添加到处理队列
    handleFileChangeForUpload({ raw: file }) // 处理文件
  } else {
    console.error('上传组件尚未准备好。')
  }
}

const handleFileChangeForUpload = (uploadFile) => {
  if (!uploadFile || !uploadFile.raw) {
    console.warn('handleFileChangeForUpload 的参数无效：', uploadFile)
    return
  }
  const file = uploadFile.raw
  // 判断是否是允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.closeAll()
    ElMessage.warning(
      `你所选的文件类型不支持: ${file.type}，请上传 JPG，JPEG 或 PNG 格式的图片。`
    )
    imageUrl.value = '' // 清空预览
    hasImage.value = false
    return
  }

  if (file.size > MAX_FILE_SIZE_BYTES_FRONTEND) {
    ElMessage.warning(
      `文件大小超出限制，请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片。`
    )
    imageUrl.value = '' // 清空预览
    hasImage.value = false
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
    hasImage.value = true
    uploadImage.value = file
  }
  reader.readAsDataURL(file)
}

const onSubmit = async () => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', uploadImage.value)
    const response = await uploadGroupAvatar({
      groupId: groupStore.activeGroup._id,
      avatar: formData
    })
    if (response.status === 'success') {
      // 根据你的后端响应结构调整
      ElMessage.success('群组头像上传成功！')
      emit('upload-success', response.data.avatarUrl)
      emit('update:visible', false)
    } else {
      ElMessage.error(`上传失败：${response.message || '未知错误'}`)
      console.error('上传失败，服务器响应:', response)
    }
  } catch (err) {
    console.error(err)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="upload-group-avatar-dialog-container">
    <BaseDialog
      :model-value="visible"
      @update:model-value="emit('update:visible', $event)"
    >
      <template #header>
        <div class="title">上传群组头像</div>
      </template>

      <div class="upload-preview" v-if="hasImage">
        <img
          :src="imageUrl"
          style="max-width: 100%; height: auto; margin-bottom: 10px"
        />
      </div>

      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :action="null"
        :auto-upload="false"
        :show-file-list="false"
        :limit="1"
        @change="handleFileChangeForUpload"
        accept="image/png, image/jpeg"
        @exceed="handleExceed"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将图片拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 JPG / JPEG / PNG 格式的图片，且大小不超过 2MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button type="primary" @click="onSubmit" :disabled="!hasImage">
          确认上传
        </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
.upload-preview img {
  display: block;
  width: 200px;
  object-fit: cover;
}

.upload-preview {
  margin-right: 40px;
}
</style>
