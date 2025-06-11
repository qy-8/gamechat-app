<script setup>
// 消息项组件 - 单条消息的展示组件。包括用户头像、用户名、时间戳等信息，消息内容可以是文本或其他类型。
import UserAvatar from './common/UserAvatar.vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
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

const newMessageSent =
  props.message.isSentByMe === true ||
  (props.message.newMessageSent &&
    props.message.sender._id === userStore.userInfo.userId)

const formatTimeAgo = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  return dayjs(timestamp).format('YYYY/MM/DD HH:mm')
}
</script>

<template>
  <div class="container">
    <!-- 引用消息 -->
    <div class="quoted-message-box" v-if="props.message.repliedTo.senderId">
      <IconMdiArrowRightTop class="icon" />
      <div class="quoted-avatar-container">
        <UserAvatar
          :src="props.message.sender.avatar"
          alt="用户头像"
          size="20"
        />
      </div>
      <div class="quoted-info">
        <div class="quoted-username">
          @<span>{{ props.message.repliedTo.senderUsername }}</span>
        </div>
        <div class="quoted-message">
          {{ props.message.repliedTo.senderSnippet }}
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
          {{ props.message.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding: 2px 0;
  margin: 20px 0;
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
}

.quoted-message {
  max-width: 290px;
  padding-left: 4px;
  color: var(--el-text-color-quoted);
  white-space: nowrap; // 不换行
  overflow: hidden; // 隐藏溢出
  text-overflow: ellipsis; // 显示省略号
}

.quoted-message-box .icon {
  margin: 0px 2px 4px 30px;
  width: 20px;
  height: 20px;
  color: var(--el-text-color-quoted);
}

.message-container--sent {
  flex-direction: row-reverse;
}

.message-container .message-meta--sent {
  // flex-direction: row-reverse;
  justify-content: flex-end;
}

.message--sent {
  display: flex;
  justify-content: flex-end;
}

.img-container .user-avatar--sent {
  margin-left: 16px;
}

.message-meta--received .message-timestamp--sent {
  padding-top: 2px;
}
</style>
