<script setup>
// import { Edit, Share } from '@element-plus/icons-vue'
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.el-icon svg {
  display: inline-block;
  color: inherit;
  fill: currentColor;
}

/* 调试用 - 如果仍有问题，添加这个 */
.icon-outline {
  outline: 1px solid red;
}
</style>
