<script setup>
import ChannelHeader from './ChannelHeader.vue'
import ChannelMessages from './ChannelMessages.vue'
import MessageInput from './MessageInput.vue'
</script>

<template>
  <div class="container">
    <div class="message-container">
      <ChannelHeader />
      <ChannelMessages />
    </div>
    <div class="input-container">
      <MessageInput />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.message-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
