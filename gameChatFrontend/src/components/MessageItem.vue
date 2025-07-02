<script setup>
import UserAvatar from './common/UserAvatar.vue'
import dayjs from 'dayjs'
import { useUserStore, useChatStore } from '@/stores'
import { computed, ref } from 'vue'

const userStore = useUserStore()
const chatStore = useChatStore()
const showActions = ref(false)
const props = defineProps({
  message: {
    type: Object,
    required: true,
    default: () => ({
      sender: {},
      repliedTo: null,
      content: '',
      createdAt: '',
      isSentByMe: null,
      messageType: ''
    })
  }
})

const newMessageSent = computed(
  () =>
    props.message.isSentByMe === true ||
    props.message.sender._id === userStore.userInfo.userId
)

const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  return dayjs(timestamp).format('YYYY/MM/DD HH:mm')
}

const previewImage = (imageUrl) => {
  if (imageUrl) {
    window.open(imageUrl, '_blank')
  }
}

const handleReply = () => {
  chatStore.setReplyingTo(props.message)
}
</script>

<template>
  <div
    class="container"
    :class="{ 'is-sent-by-me': newMessageSent }"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- 引用消息 -->
    <div class="quoted-message-box" v-if="props.message?.repliedTo?.senderId">
      <IconMdiArrowRightTop class="icon" v-if="!newMessageSent" />
      <IconMdiArrowLeftTop v-else class="icon icon--sent" />  
      <div class="quoted-avatar-container">
        <UserAvatar
          :src="props.message.repliedTo.senderAvatar"
          alt="用户头像"
          :size="20"
        />
      </div>
      <div class="quoted-info">
        <div class="quoted-username">
          @<span>{{ props.message.repliedTo.senderUsername }}</span>
        </div>
        <div class="quoted-message">
          {{ props.message.repliedTo.contentSnippet }}
        </div>
      </div>
    </div>

    <!-- 主消息体 -->
    <div
      class="message-container--received"
      :class="{
        'message-container--sent': newMessageSent === true
      }"
    >
      <div class="img-container">
        <UserAvatar
          :src="props.message.sender.avatar"
          alt="用户头像"
          class="user-avatar--received"
          :class="{
            'user-avatar--sent': newMessageSent === true
          }"
        />
      </div>
      <div class="message-info">
        <div
          class="message-meta--received"
          :class="{
            'message-meta--sent': newMessageSent === true
          }"
        >
          <div
            class="username--received"
            :class="{
              'username--sent': newMessageSent === true
            }"
          >
            {{ props.message.sender.username }}
          </div>
          <div
            class="message-timestamp--received"
            :class="{
              'message-timestamp--sent': newMessageSent === true
            }"
          >
            {{ formatTimeAgo(props.message.createdAt) }}
          </div>
        </div>
        <div
          :class="{
            'message--sent': newMessageSent === true
          }"
        >
          <div class="message-content-wrapper">
            <div
              class="text-content"
              v-if="props.message.messageType === 'text'"
            >
              {{ props.message.content }}
            </div>
            <div
              class="image-content"
              v-else-if="props.message.messageType === 'image'"
              @click="previewImage(props.message.content)"
            >
              <img
                :src="props.message.content"
                alt="聊天图片"
                loading="lazy"
                @load="$emit('image-loaded')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="message-actions" v-show="showActions">
        <el-tooltip content="回复" placement="top">
          <div class="action-icon" @click="handleReply">
            <IconMdiReply />
          </div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  max-width: 100%;
  padding: 2px 0 4px 0;
  margin: 30px 0;
}

.container:hover {
  background-color: var(--el-bg-color-message-item-hover);
}

.message-container--received {
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  color: var(--el-text-color-regular);
}

.message-info {
  flex: 1;
}

.img-container .user-avatar--received {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 50%;
}

.message-container .message-meta--received {
  display: flex;
  align-items: baseline;
}

.message-meta--received .username--received {
  margin-right: 6px;
  font-size: 16px;
}

.username--sent {
  margin-left: 6px;
  display: none;
}

.message-meta--received .message-timestamp--received {
  font-size: 14px;
  color: #b0b0b0;
}

.quoted-message-box {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.quoted-avatar-container img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.quoted-info {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding-left: 4px;
  color: var(--el-text-color-regular);
  min-width: 0;
}

.quoted-message {
  max-width: 80%;
  padding-left: 4px;
  color: var(--el-text-color-quoted);
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏溢出 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.quoted-message-box .icon {
  margin: 0px 2px 4px 30px;
  width: 20px;
  height: 20px;
  color: var(--el-text-color-quoted);
}

.container.is-sent-by-me .quoted-message-box,
.container.is-sent-by-me .quoted-info {
  flex-direction: row-reverse;
}

.container.is-sent-by-me .quoted-username {
  margin-right: 4px;
}

.icon.icon--sent {
  margin: 0px 46px 4px 2px;
}

.message-container--sent {
  flex-direction: row-reverse;
}

.container.is-sent-by-me .quoted-message-box .quoted-message {
  padding: 0 4px 0 0;
}

.message-container .message-meta--sent {
  justify-content: flex-end;
}

.message-content-wrapper {
  max-width: 95%;
}

.message--sent {
  display: flex;
  justify-content: flex-end;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

.img-container .user-avatar--sent {
  margin-left: 16px;
}

.message-meta--received .message-timestamp--sent {
  padding-top: 2px;
}

.image-content {
  max-width: 180px;
  max-height: 180px;
  cursor: pointer;
}

.image-content img {
  border-radius: 20px;
  object-fit: cover;
}

.message-actions {
  position: absolute;
  top: -20px;
  right: 32px;
  background-color: var(--el-bg-color-overlay);
  padding: 8px 8px 4px 8px;
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-lighter);

  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.action-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 18px;
}

.action-icon:hover {
  color: var(--el-text-color-primary);
}

.container.is-sent-by-me .message-actions {
  right: auto;
  left: 32px;
}
</style>
