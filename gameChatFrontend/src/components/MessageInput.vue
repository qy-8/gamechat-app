<script setup>
/**
 * @file MessageInput.vue
 * @description 聊天消息输入组件，支持文本输入、表情选择、图片上传、@提及功能和回复消息。
 * @component MessageInput
 */
import { computed, ref } from 'vue'
import { useChatStore, useThemeStore, useGroupStore } from '../stores'
import {
  sendMessage as sendPrivateMessage,
  sendMessageInChannel,
  uploadImageAPI
} from '../api/chat'
import { onClickOutside } from '@vueuse/core'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'

const messageInput = ref('')
const messageType = ref('text')
const chatStore = useChatStore()
// 表情选择器显示状态
const showEmojiPicker = ref(false)
const themeStore = useThemeStore()
// 表情选择器和触发器元素引用
const emojiPickerRef = ref(null)
const emojiTriggerRef = ref(null)
const groupStore = useGroupStore()
const { groupMembers } = storeToRefs(groupStore) // 群组成员列表，用于@提及
// 被提及的用户Map，键为用户名，值为用户ID
const mentionedUsers = ref(new Map())

// 根据主题模式计算表情选择器主题
const pickerTheme = computed(() => (themeStore.isDarkMode ? 'dark' : 'light'))

// @提及选项，基于群组成员列表
const mentionOptions = computed(() => {
  if (!groupMembers.value) {
    return []
  }
  return groupMembers.value.map((member) => ({
    value: member.username,
    label: member.username,
    avatar: member.avatar,
    id: member._id
  }))
})

// 点击表情选择器外部区域时隐藏
onClickOutside(
  emojiPickerRef,
  () => {
    showEmojiPicker.value = false
  },
  {
    ignore: [emojiTriggerRef] // 忽略表情触发器点击
  }
)

/**
 * 处理图片上传。
 * 上传图片到服务器，并显示加载和结果消息。
 * @param {object} options - Element Plus upload 组件提供的上传选项。
 */
const handleUpload = async (options) => {
  const file = options.file
  const conversation = chatStore.activeConversation
  if (!conversation) {
    return options.onError(new Error('未选择聊天'))
  }

  const loadingInstance = ElMessage({
    message: '图片上传中...',
    type: 'info',
    duration: 0
  })

  try {
    const uploadResponse = await uploadImageAPI({
      conversationId: conversation._id,
      file: file
    })

    options.onSuccess(uploadResponse.data) // 通知上传组件上传成功
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片发送失败')
    options.onError(error) // 通知上传组件上传失败
  } finally {
    loadingInstance.close()
  }
}

/**
 * 发送输入框中的消息。
 * 根据会话类型（私聊或群聊）调用不同的发送API，并处理@提及和回复消息。
 */
const sendInputMessage = async () => {
  const content = messageInput.value.trim()
  const repliedToMessage = chatStore.replyingToMessage

  if (!content) {
    return
  }

  messageInput.value = ''

  const messagePayload = {
    conversationId: chatStore.activeConversation._id,
    content,
    messageType: messageType.value,
    repliedTo: repliedToMessage
      ? {
          messageId: repliedToMessage._id,
          contentSnippet: repliedToMessage.content.substring(0, 50),
          senderId: repliedToMessage.sender._id,
          senderUsername: repliedToMessage.sender.username,
          senderAvatar: repliedToMessage.sender.avatar
        }
      : null
  }

  // 根据会话类型发送消息
  if (chatStore.activeConversation?.type === 'private') {
    try {
      chatStore.clearReplyingTo() // 清除回复状态
      await sendPrivateMessage({
        ...messagePayload
      })
    } catch (error) {
      console.error('发送私聊消息失败:', error)
    }
  } else if (chatStore.activeConversation?.type === 'group') {
    try {
      const mentionIds = Array.from(mentionedUsers.value.values()) // 获取被提及用户的ID
      mentionedUsers.value.clear() // 清空提及列表
      chatStore.clearReplyingTo() // 清除回复状态
      await sendMessageInChannel({
        ...messagePayload,
        channelId: chatStore.activeConversation._id,
        mentionIds
      })
    } catch (error) {
      console.error('发送群聊消息失败:', error)
    }
  }
}

/**
 * 选择表情后，将其添加到消息输入框。
 * @param {object} emoji - 被选中的表情对象。
 */
const onSelectEmoji = (emoji) => {
  messageInput.value += emoji.i
  showEmojiPicker.value = false // 隐藏表情选择器
}

/**
 * 当在 @提及列表中选择用户时触发。
 * 将被提及的用户信息添加到 mentionedUsers Map。
 * @param {object} option - 被选中的提及选项。
 */
const onMentionSelect = (option) => {
  mentionedUsers.value.set(option.value, option.id)
}

/**
 * 清除当前回复的消息状态。
 */
const clearRepliedToMessage = () => {
  chatStore.clearReplyingTo()
}
</script>

<template>
  <div class="message-input-container">
    <!-- 显示用户对他人消息引用的区域 开始 -->
    <Transition name="reply-fade">
      <div class="reply-message-container" v-if="chatStore.replyingToMessage">
        <div class="reply-message">
          {{ chatStore.replyingToMessage.content || '引用并回复消息' }}
        </div>
        <div class="cancel-icon" @click="clearRepliedToMessage">
          <IconMdiCloseCircle class="icon" />
        </div>
      </div>
    </Transition>
    <!-- 显示用户对他人消息引用的区域 结束 -->

    <!-- 用户输入框 开始 -->
    <div
      class="message-container"
      :class="{ 'message-box-border': chatStore.replyingToMessage === null }"
    >
      <div class="text-input">
        <el-mention
          v-model="messageInput"
          :placeholder="
            chatStore.activeConversation?.type === 'group'
              ? '发送消息，或输入 @ 来提及成员'
              : '发送消息'
          "
          @keyup.enter.prevent="sendInputMessage"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 3 }"
          :options="mentionOptions"
          @select="onMentionSelect"
        >
        </el-mention>
      </div>
      <div class="input-tools">
        <div
          class="emoji icon"
          @click="showEmojiPicker = !showEmojiPicker"
          ref="emojiTriggerRef"
        >
          <IconMdiEmoticonHappyOutline />
        </div>
        <el-upload
          class="image-uploader icon"
          :show-file-list="false"
          :auto-upload="true"
          :http-request="handleUpload"
          accept="image/png, image/jpeg"
        >
          <div class="image-upload icon">
            <IconMdiFileImageOutline />
          </div>
        </el-upload>
      </div>
    </div>
    <!-- 用户输入框 结束 -->

    <EmojiPicker
      v-if="showEmojiPicker"
      :native="true"
      @select="onSelectEmoji"
      class="emoji-picker"
      :theme="pickerTheme"
      ref="emojiPickerRef"
    />
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 消息输入容器
 # 描述：定义整个消息输入区域的布局和相对定位。
\*------------------------------------*/
.message-input-container {
  position: relative;
  margin: 0 10px 30px 4px;
  display: flex;
  flex-direction: column;
  color: var(--el-text-color-secondary);
}

/*------------------------------------*\
 # 回复消息容器
 # 描述：定义显示被回复消息的区域布局和高度。
\*------------------------------------*/
.reply-message-container {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/*------------------------------------*\
 # 消息输入主容器
 # 描述：定义消息输入框、表情和上传工具的整体容器样式。
\*------------------------------------*/
.message-container {
  min-height: 50px;
  padding: 8px 0;
  height: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-message-item-hover);
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

/*------------------------------------*\
 # 消息框圆角（无回复时）
 # 描述：当没有回复消息时，消息输入框的边框圆角样式。
\*------------------------------------*/
.message-box-border {
  border-radius: 10px 10px;
}

/*------------------------------------*\
 # 输入工具栏
 # 描述：定义输入框右侧工具（表情、图片）的布局。
\*------------------------------------*/
.input-tools {
  display: flex;
  padding: 0 8px;
  font-size: 18px;
}

/*------------------------------------*\
 # 输入工具栏图标
 # 描述：定义输入工具栏内每个图标的布局和鼠标样式。
\*------------------------------------*/
.input-tools .icon {
  display: flex;
  padding: 0 4px;
  cursor: pointer;
}

/*------------------------------------*\
 # 回复消息和文本输入区域
 # 描述：定义回复消息和主文本输入框的弹性尺寸和内边距。
\*------------------------------------*/
.reply-message,
.text-input {
  flex: 1;
  padding: 0 10px;
}

/*------------------------------------*\
 # 回复消息文本样式
 # 描述：定义被回复消息文本的字体、内边距和溢出处理。
\*------------------------------------*/
.reply-message {
  font-size: 14px;
  padding: 8px 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*------------------------------------*\
 # Element Plus 输入框背景透明化
 # 描述：覆盖 Element Plus 输入框的默认样式，使其背景透明并移除阴影。
\*------------------------------------*/
::v-deep(.el-input__wrapper) {
  background-color: transparent;
  box-shadow: none;
}

::v-deep(.el-input__wrapper):hover {
  box-shadow: none;
}
::v-deep(.el-input__wrapper:focus-within) {
  box-shadow: none;
}

/*------------------------------------*\
 # Element Plus 文本域样式自定义
 # 描述：覆盖 Element Plus 文本域的默认样式，使其背景透明、无阴影，并自定义滚动条。
\*------------------------------------*/
::v-deep(.el-textarea__inner) {
  background-color: transparent;
  box-shadow: none;
  resize: none; /* 禁用拖拽调整大小 */

  &::-webkit-scrollbar {
    width: 4px;
  }

  /* 滚动条轨道 */
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    background: var(--el-webkit-scrollbar-color);
    border-radius: 3px;
  }

  /* 悬浮在滑块上时 */
  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-webkit-scrollbar-hover);
  }
}

::v-deep(.el-textarea__inner):hover {
  box-shadow: none;
}
::v-deep(.el-textarea__inner:focus-within) {
  box-shadow: none;
}

/*------------------------------------*\
 # 回复消息容器背景和圆角
 # 描述：设置回复消息容器的背景颜色和顶部圆角。
\*------------------------------------*/
.reply-message-container {
  background-color: var(--el-bg-color-group-list);
  border-radius: 10px 10px 0 0;
}

/*------------------------------------*\
 # 取消回复图标
 # 描述：定义取消回复图标的布局、边框和鼠标样式。
\*------------------------------------*/
.cancel-icon {
  display: flex;
  padding: 0 12px;
  border-left: 1px solid;
  cursor: pointer;
}

/*------------------------------------*\
 # 表情选择器定位
 # 描述：定位表情选择器在输入框上方和右侧。
\*------------------------------------*/
.emoji-picker {
  position: absolute;
  bottom: 52px;
  right: 10px;
  z-index: 10;
}

/*------------------------------------*\
 # 图片上传组件焦点样式
 # 描述：确保图片上传组件在聚焦时保持图标颜色。
\*------------------------------------*/
::v-deep(.image-uploader) {
  *:focus {
    color: inherit;
  }
}

/*------------------------------------*\
 # 图标通用居中对齐
 # 描述：使所有功能图标垂直居中。
\*------------------------------------*/
.icon {
  display: flex;
  align-items: center;
}

/*------------------------------------*\
 # 回复消息过渡动画
 # 描述：定义回复消息容器出现和消失时的过渡效果。
\*------------------------------------*/
.reply-fade-enter-from,
.reply-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* 向上移动 */
}

.reply-fade-enter-active,
.reply-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease; /* 0.3秒的透明度和位移过渡 */
}

/* 过渡结束状态，以及离开过渡的开始状态 */
.reply-fade-enter-to,
.reply-fade-leave-from {
  opacity: 1;
  transform: translateY(0); /* 恢复到原始位置 */
}
</style>
