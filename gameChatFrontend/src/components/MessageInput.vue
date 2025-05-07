<script setup>
// 消息输入框组件（MessageInput）：用户输入消息的地方。支持文本输入、表情符号、附件上传等功能。
</script>
<template>
  <div class="message-input-container">
    <div class="reply-message-container">
      <div class="reply-message">
        <el-input placeholder="引用并回复消息" />
      </div>
      <div class="cancel-icon"><IconMdiCloseCircle class="icon" /></div>
    </div>
    <div class="message-container">
      <div class="text-input">
        <el-input placeholder="发送消息" />
      </div>
      <div class="input-tools">
        <div class="emoji icon">
          <IconMdiEmoticonHappyOutline />
          <Icon icon="mdi:emotzicon-happy-outline" />
        </div>
        <div class="image-upload icon">
          <IconMdiFileImageOutline />
        </div>
        <div class="mention-user icon">
          <IconMdiAt />
        </div>
        <div class="markdown-editor icon">
          <IconMdiLanguageMarkdown />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-input-container {
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
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-message-item-hover);
  border-radius: 0 0 10px 10px;
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

// 使输入框背景透明
::v-deep(.el-input__wrapper) {
  background-color: transparent;
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
</style>
