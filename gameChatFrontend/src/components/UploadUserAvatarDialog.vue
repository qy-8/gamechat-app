<script setup>
/**
 * @file UploadUserAvatarDialog.vue
 * @description 用于上传和更换用户头像的对话框组件。
 * @component UploadUserAvatarDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框可见状态改变时触发。
 * @emits upload-success - 当用户头像成功上传时触发，并传递新头像的URL。
 */
import { UploadFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'
import BaseDialog from './common/BaseDialog.vue'
import { ElMessage, genFileId } from 'element-plus'
import { uploadUserAvatar } from '../api/user'

const uploadRef = ref(null)
const MAX_FILE_SIZE_MB = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB)
const MAX_FILE_SIZE_BYTES_FRONTEND = MAX_FILE_SIZE_MB * 1024 * 1024

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'upload-success'])
const imageUrl = ref('') // 存储预览图片的 URL
const hasImage = ref(false) // 控制预览图片的显示
const uploading = ref(false)
// 待上传的图片文件
const uploadImage = ref(null)

/**
 * 处理文件超出限制数量的情况。
 * 清除现有文件，并处理新选择的文件。
 * @param {Array<File>} files - 新选择的文件数组。
 */
const handleExceed = (files) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles() // 清除文件列表，移除旧文件
    const file = files[0] // 获取第一个文件
    file.uid = genFileId() // 为新文件生成唯一ID
    uploadRef.value.handleStart(file) // 将新文件添加到处理队列
    handleFileChangeForUpload({ raw: file }) // 手动触发文件处理
  } else {
    console.error('上传组件尚未准备好。')
  }
}

/**
 * 处理文件选择或改变事件，进行文件校验和预览。
 * @param {object} uploadFile - Element Plus upload 组件的 file 对象。
 */
const handleFileChangeForUpload = (uploadFile) => {
  if (!uploadFile || !uploadFile.raw) {
    console.warn('handleFileChangeForUpload 的参数无效：', uploadFile)
    return
  }
  const file = uploadFile.raw
  // 允许的文件类型
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

  // 文件大小校验
  if (file.size > MAX_FILE_SIZE_BYTES_FRONTEND) {
    ElMessage.warning(
      `文件大小超出限制，请上传小于 ${MAX_FILE_SIZE_MB}MB 的图片。`
    )
    imageUrl.value = '' // 清空预览
    hasImage.value = false
    return
  }

  // 使用 FileReader 读取文件进行预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result // 设置预览图片URL
    hasImage.value = true // 显示预览
    uploadImage.value = file // 存储待上传的原始文件
  }
  reader.readAsDataURL(file) // 读取文件为 Data URL
}

/**
 * 提交上传用户头像。
 * 构建 FormData，调用上传 API，并处理上传结果。
 */
const onSubmit = async () => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', uploadImage.value) // 添加图片文件到 FormData
    const response = await uploadUserAvatar(formData) // 调用上传用户头像的 API
    if (response.status === 'success') {
      ElMessage.success('头像更换成功！')
      emit('upload-success', response.data.avatarUrl) // 触发上传成功事件，并传递新头像URL
      emit('update:visible', false) // 关闭对话框
    } else {
      ElMessage.error(`上传失败：${response.message || '未知错误'}`)
      console.error('上传失败，服务器响应:', response)
    }
  } catch (err) {
    console.error(err)
  } finally {
    uploading.value = false // 无论成功失败都解除上传中状态
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
        <div class="title">更换头像</div>
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
          确认更换
        </el-button>
      </template>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 上传预览图片样式
 # 描述：定义预览图片的显示尺寸和适应方式。
\*------------------------------------*/
.upload-preview img {
  display: block;
  width: 200px;
  object-fit: cover;
}

/*------------------------------------*\
 # 上传预览容器外边距
 # 描述：设置图片预览容器的右侧外边距。
\*------------------------------------*/
.upload-preview {
  margin-right: 40px;
}
</style>
