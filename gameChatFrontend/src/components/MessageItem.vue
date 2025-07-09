<script setup>
/**
 * @file MessageItem.vue
 * @description 单条聊天消息的展示组件，支持显示文本/图片消息、引用回复，并区分发送者和接收者。
 * @component MessageItem
 * @property {object} message - 消息对象，包含发送者、内容、时间戳、是否由我发送等信息。
 * @emits image-loaded - 当图片消息加载完成后触发。
 */
import UserAvatar from './common/UserAvatar.vue'
import dayjs from 'dayjs'
import { useUserStore, useChatStore } from '@/stores'
import { computed, ref } from 'vue'

const userStore = useUserStore()
const chatStore = useChatStore()
// 控制消息操作（如回复）的显示状态
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

// 计算属性，判断消息是否由当前用户发送
const newMessageSent = computed(
  () =>
    props.message.isSentByMe === true ||
    props.message.sender._id === userStore.userInfo.userId
)

/**
 * 格式化时间戳为指定格式。
 * @param {string} timestamp - 消息时间戳。
 * @returns {string} 格式化后的时间字符串。
 */
const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  return dayjs(timestamp).format('YYYY/MM/DD HH:mm')
}

/**
 * 预览图片消息，在新窗口打开图片。
 * @param {string} imageUrl - 图片的URL。
 */
const previewImage = (imageUrl) => {
  if (imageUrl) {
    window.open(imageUrl, '_blank')
  }
}

/**
 * 处理回复消息操作，设置聊天 Store 中的回复目标消息。
 */
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
/*------------------------------------*\
 # 消息容器
 # 描述：定义单条消息的整体布局、内边距和外边距，以及悬停背景色。
\*------------------------------------*/
.container {
  position: relative;
  max-width: 100%;
  padding: 2px 0 4px 0;
  margin: 30px 0;
}

.container:hover {
  background-color: var(--el-bg-color-message-item-hover);
}

/*------------------------------------*\
 # 接收消息样式
 # 描述：定义接收到的消息的弹性布局和文本颜色。
\*------------------------------------*/
.message-container--received {
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  color: var(--el-text-color-regular);
}

/*------------------------------------*\
 # 消息信息区
 # 描述：使消息信息（元数据和内容）占据可用空间。
\*------------------------------------*/
.message-info {
  flex: 1;
}

/*------------------------------------*\
 # 接收方头像样式
 # 描述：定义接收方头像的尺寸、外边距和圆角。
\*------------------------------------*/
.img-container .user-avatar--received {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 50%;
}

/*------------------------------------*\
 # 接收方消息元数据
 # 描述：定义接收方消息元数据（用户名和时间戳）的布局。
\*------------------------------------*/
.message-container .message-meta--received {
  display: flex;
  align-items: baseline;
}

/*------------------------------------*\
 # 接收方用户名样式
 # 描述：定义接收方用户名的字体大小和右侧外边距。
\*------------------------------------*/
.message-meta--received .username--received {
  margin-right: 6px;
  font-size: 16px;
}

/*------------------------------------*\
 # 发送方用户名样式
 # 描述：发送方用户名默认隐藏（或通过其他方式显示）。
\*------------------------------------*/
.username--sent {
  margin-left: 6px;
  display: none;
}

/*------------------------------------*\
 # 接收方消息时间戳
 # 描述：定义接收方消息时间戳的字体大小和颜色。
\*------------------------------------*/
.message-meta--received .message-timestamp--received {
  font-size: 14px;
  color: var(--el-text-color-timestamp);
}

/*------------------------------------*\
 # 引用消息框样式
 # 描述：定义显示被引用消息的容器布局和字体大小。
\*------------------------------------*/
.quoted-message-box {
  display: flex;
  align-items: center;
  font-size: 14px;
}

/*------------------------------------*\
 # 引用消息头像容器
 # 描述：定义被引用消息头像的尺寸和圆角。
\*------------------------------------*/
.quoted-avatar-container img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

/*------------------------------------*\
 # 引用消息信息区
 # 描述：定义被引用消息的用户名和内容片段的布局和颜色。
\*------------------------------------*/
.quoted-info {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding-left: 4px;
  color: var(--el-text-color-regular);
  min-width: 0; /* 允许内容收缩 */
}

/*------------------------------------*\
 # 引用消息内容片段
 # 描述：定义被引用消息内容片段的宽度、内边距和文本溢出处理。
\*------------------------------------*/
.quoted-message {
  max-width: 80%;
  padding-left: 4px;
  color: var(--el-text-color-quoted);
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏溢出 */
  text-overflow: ellipsis; /* 显示省略号 */
}

/*------------------------------------*\
 # 引用消息图标
 # 描述：定义引用消息图标的尺寸、外边距和颜色。
\*------------------------------------*/
.quoted-message-box .icon {
  margin: 0px 2px 4px 30px;
  width: 20px;
  height: 20px;
  color: var(--el-text-color-quoted);
}

/*------------------------------------*\
 # 发送方引用消息样式
 # 描述：当消息由当前用户发送时，引用消息框和引用信息的反向布局。
\*------------------------------------*/
.container.is-sent-by-me .quoted-message-box,
.container.is-sent-by-me .quoted-info {
  flex-direction: row-reverse;
}

/*------------------------------------*\
 # 发送方引用消息用户名
 # 描述：当消息由当前用户发送时，引用消息用户名的右侧外边距。
\*------------------------------------*/
.container.is-sent-by-me .quoted-username {
  margin-right: 4px;
}

/*------------------------------------*\
 # 发送方引用消息图标
 # 描述：当消息由当前用户发送时，引用消息图标的外边距。
\*------------------------------------*/
.icon.icon--sent {
  margin: 0px 46px 4px 2px;
}

/*------------------------------------*\
 # 发送消息样式
 # 描述：定义发送方消息的弹性布局，使其内容靠右显示。
\*------------------------------------*/
.message-container--sent {
  flex-direction: row-reverse;
}

/*------------------------------------*\
 # 发送方引用消息内容
 # 描述：当消息由当前用户发送时，引用消息内容的内边距。
\*------------------------------------*/
.container.is-sent-by-me .quoted-message-box .quoted-message {
  padding: 0 4px 0 0;
}

/*------------------------------------*\
 # 发送方消息元数据
 # 描述：定义发送方消息元数据（用户名和时间戳）的对齐方式。
\*------------------------------------*/
.message-container .message-meta--sent {
  justify-content: flex-end;
}

/*------------------------------------*\
 # 消息内容包裹器
 # 描述：限制消息内容的最大宽度。
\*------------------------------------*/
.message-content-wrapper {
  max-width: 95%;
}

/*------------------------------------*\
 # 发送消息内容
 # 描述：定义发送消息内容的布局、文本换行和断词。
\*------------------------------------*/
.message--sent {
  display: flex;
  justify-content: flex-end;
  max-width: 100%;
  white-space: pre-wrap; /* 保留空白符和换行 */
  word-wrap: break-word; /* 长单词在任意位置换行 */
  word-break: break-word; /* 进一步强制长单词断开 */
}

/*------------------------------------*\
 # 发送方头像样式
 # 描述：定义发送方头像的左侧外边距。
\*------------------------------------*/
.img-container .user-avatar--sent {
  margin-left: 16px;
}

/*------------------------------------*\
 # 发送方时间戳样式
 # 描述：定义发送方时间戳的顶部内边距。
\*------------------------------------*/
.message-meta--received .message-timestamp--sent {
  padding-top: 2px;
}

/*------------------------------------*\
 # 图片消息内容
 # 描述：定义图片消息的最大尺寸和鼠标样式。
\*------------------------------------*/
.image-content {
  margin-top: 6px;
  max-width: 180px;
  max-height: 180px;
  cursor: pointer;
}

/*------------------------------------*\
 # 图片消息图片样式
 # 描述：定义图片消息中图片的圆角和适应方式。
\*------------------------------------*/
.image-content img {
  border-radius: 20px;
  object-fit: cover;
}

/*------------------------------------*\
 # 消息操作按钮区
 # 描述：定义消息操作（如回复）按钮的定位、背景和阴影，默认不透明。
\*------------------------------------*/
.message-actions {
  position: absolute;
  top: -20px; /* 定位在消息气泡上方 */
  right: 32px;
  background-color: var(--el-bg-color-overlay);
  padding: 8px 8px 4px 8px;
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-lighter);

  opacity: 1; /* 默认显示 */
  transition: opacity 0.2s ease-in-out;
}

/*------------------------------------*\
 # 消息操作图标
 # 描述：定义操作图标的鼠标样式、颜色和字体大小。
\*------------------------------------*/
.action-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 18px;
}

/*------------------------------------*\
 # 消息操作图标悬停样式
 # 描述：定义操作图标在鼠标悬停时的颜色。
\*------------------------------------*/
.action-icon:hover {
  color: var(--el-text-color-primary);
}

/*------------------------------------*\
 # 发送方消息操作定位
 # 描述：当消息由当前用户发送时，消息操作按钮区的左侧定位。
\*------------------------------------*/
.container.is-sent-by-me .message-actions {
  right: auto;
  left: 32px;
}
</style>
