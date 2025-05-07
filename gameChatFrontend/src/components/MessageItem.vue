<script setup>
// 消息项组件 - 单条消息的展示组件。包括用户头像、用户名、时间戳等信息，消息内容可以是文本或其他类型。
</script>

<template>
  <div class="container">
    <!-- 引用消息 -->
    <div class="quoted-message-box">
      <IconMdiArrowRightTop class="icon" />
      <div class="quoted-avatar-container">
        <img src="/images/photo.png" alt="头像" />
      </div>
      <div class="quoted-info">
        <div class="quoted-username">@<span>xiaoMao</span></div>
        <div class="quoted-message">
          你是你是好你好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好
        </div>
      </div>
    </div>

    <!-- 主消息体 -->
    <div class="message-container">
      <div class="img-container">
        <img src="/images/photo.png" alt="头像" class="user-avatar" />
      </div>
      <div class="message-info">
        <div class="message-meta">
          <div class="username">Dzwzd</div>
          <div class="message-timestamp">2025/4/13 23:35</div>
        </div>
        <div class="message">
          好你好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好好你好你好好你好你好好你好好你好你好好你好好你好你好好你好好
          你好你好好你好好你好好你好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好好你
          好你好好你好你好好你好好你好你好好你
          好好你好你好好你好好你好你好好你好好你好好你好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好<br />
          你好好你好好<br /><br />你好你好好你好好你好你好好你好好你好你好好你好好你好你好好你好好你好你好好
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding: 2px 0;
}

.container:hover {
  background-color: var(--el-bg-color-message-item-hover);
}

.message-container {
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  color: var(--el-text-color-regular);
}

.message-info {
  flex: 1;
}

.img-container .user-avatar {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 50%;
}

.message-container .message-meta {
  display: flex;
  align-items: baseline;
}

.message-meta .username {
  margin-right: 6px;
  font-size: 18px;
}

.message-meta .message-timestamp {
  font-size: 14px;
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
</style>
