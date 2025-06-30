<script setup>
// 消息输入框组件（MessageInput）：用户输入消息的地方。支持文本输入、表情符号、附件上传等功能。
import { computed, ref } from 'vue'
import {
  useChatStore,
  useChannelStore,
  useThemeStore,
  useGroupStore
} from '../stores'
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
import UserBadge from './common/UserBadge.vue'

const messageInput = ref('')
const messageType = ref('text')
const chatStore = useChatStore()
const channelStore = useChannelStore()
const showEmojiPicker = ref(false)
const themeStore = useThemeStore()
const emojiPickerRef = ref(null)
const emojiTriggerRef = ref(null)
const groupStore = useGroupStore()
const { groupMembers } = storeToRefs(groupStore)
const mentionedUsers = ref(new Map())

const pickerTheme = computed(() => (themeStore.isDarkMode ? 'dark' : 'light'))

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

onClickOutside(
  emojiPickerRef,
  () => {
    showEmojiPicker.value = false
  },
  {
    ignore: [emojiTriggerRef]
  }
)

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

    // const imageUrl = uploadResponse.data.imageUrl
    options.onSuccess(uploadResponse.data)
    loadingInstance.close()
  } catch (error) {
    console.error(error)
    ElMessage.error('图片发送失败')
    options.onError(error)
  } finally {
    loadingInstance.close()
  }
}

// const sendInputMessage = async () => {
//   const content = messageInput.value.trim()

//   if (!content) {
//     return
//   }

//   messageInput.value = ''

//   if (chatStore.activeConversation?.type === 'private') {
//     try {
//       const response = await sendPrivateMessage({
//         conversationId: chatStore.activeConversation._id,
//         content,
//         messageType: messageType.value
//       })
//       console.log(response)
//     } catch (error) {
//       console.error(error)
//     }
//   } else if (chatStore.activeConversation?.type === 'group') {
//     try {
//       const mentionIds = Array.from(mentionedUsers.value.values())
//       console.log(mentionedUsers.value.values(), mentionIds)
//       mentionedUsers.value.clear()

//       const response = await sendMessageInChannel({
//         channelId: chatStore.activeConversation._id,
//         content,
//         messageType: messageType.value,
//         mentionIds
//       })
//       console.log(response)
//     } catch (error) {
//       console.error(error)
//     }
//   }
// }

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

  console.log(messagePayload)
  if (chatStore.activeConversation?.type === 'private') {
    try {
      const response = await sendPrivateMessage({
        ...messagePayload
      })
      console.log(response)
    } catch (error) {
      console.error(error)
    }
  } else if (chatStore.activeConversation?.type === 'group') {
    try {
      const mentionIds = Array.from(mentionedUsers.value.values())
      console.log(mentionedUsers.value.values(), mentionIds)
      mentionedUsers.value.clear()
      chatStore.clearReplyingTo()
      const response = await sendMessageInChannel({
        ...messagePayload,
        channelId: chatStore.activeConversation._id,
        mentionIds
      })
      console.log(response)
    } catch (error) {
      console.error(error)
    }
  }
}

const onSelectEmoji = (emoji) => {
  messageInput.value += emoji.i
  showEmojiPicker.value = false
}

const onMentionSelect = (option) => {
  mentionedUsers.value.set(option.value, option.id)
  console.log('已提及用户:', mentionedUsers.value)
}

const clearRepliedToMessage = () => {
  chatStore.clearReplyingTo()
}
</script>
<template>
  <div class="message-input-container">
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

        <!-- <div
          class="mention-user icon"
          v-if="chatStore.activeConversation.type === 'group'"
        >
          <IconMdiAt />
        </div> -->
        <!-- <div class="markdown-editor icon">
          <IconMdiLanguageMarkdown />
        </div> -->
      </div>
    </div>
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
.message-input-container {
  position: relative;
  margin: 0 10px 30px 4px;
  display: flex;
  flex-direction: column;
  color: var(--el-text-color-secondary);
}

.reply-message-container {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-container {
  min-height: 50px;
  // max-height: 60px;
  padding: 8px 0;
  height: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-message-item-hover);
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.message-box-border {
  border-radius: 10px 10px;
}

.input-tools {
  display: flex;
  padding: 0 8px;
  font-size: 18px;
}

.input-tools .icon {
  display: flex;
  padding: 0 4px;
  cursor: pointer;
}

.reply-message,
.text-input {
  flex: 1;
  padding: 0 10px;
}

.reply-message {
  font-size: 14px;
  padding: 8px 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 使输入框背景透明
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

::v-deep(.el-textarea__inner) {
  background-color: transparent;
  box-shadow: none;
  resize: none;

  &::-webkit-scrollbar {
    width: 4px;
  }

  // 滚动条轨道
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  // 滚动条滑块
  &::-webkit-scrollbar-thumb {
    background: var(--el-webkit-scrollbar-color);
    border-radius: 3px;
  }

  // 悬浮在滑块上时
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

.reply-message-container {
  background-color: var(--el-bg-color-group-list);
  border-radius: 10px 10px 0 0;
}

.cancel-icon {
  display: flex;
  padding: 0 12px;
  border-left: 1px solid;
  cursor: pointer;
}

.emoji-picker {
  position: absolute;
  bottom: 52px;
  right: 10px;
  z-index: 10;
}

::v-deep(.image-uploader) {
  *:focus {
    color: inherit;
  }
}

.icon {
  display: flex;
  align-items: center;
}

.reply-fade-enter-from,
.reply-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px); // 向上移动
}

.reply-fade-enter-active,
.reply-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease; // 0.3秒的透明度和位移过渡
}

// 过渡结束状态，以及离开过渡的开始状态
.reply-fade-enter-to,
.reply-fade-leave-from {
  opacity: 1;
  transform: translateY(0); // 恢复到原始位置
}
</style>
