<script setup>
import { ref } from 'vue'
import ChatIcon from '../components/GameChatIcon.vue'
import { useThemeStore } from '@/stores/modules/themeStore'
import ThemeSwitch from '@/components/ThemeToggle.vue'
import router from '@/router'

const themeStore = useThemeStore()
// 初始化主题
themeStore.initTheme()
</script>

<template>
  <div class="container">
    <!-- 导航栏 -->
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <!-- svg logo -->
      <el-menu-item class="no-hover-bg" @click="$router.push('/')">
        <span class="logo">
          <ChatIcon />
        </span>
        GameChat
      </el-menu-item>

      <!-- 其他菜单项 -->
      <el-menu-item index="1" @click="$router.push('/')">探索</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/auth')">注册</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/auth')">登陆</el-menu-item>
      <el-menu-item index="4" @click="$router.push('/chat')"
        >个人中心</el-menu-item
      >
      <el-menu-item><ThemeSwitch /></el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
/* 版心样式设置 */

.container {
  max-width: 1706px;
  margin: 0 auto;
}
/* 导航栏样式 */

.el-menu--horizontal {
  border-bottom: none;
}
/* svg logo 样式 */
.logo svg {
  vertical-align: middle;
  margin-right: 8px;
}
/* 除 logo 区域，整体靠右 */
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

:deep(.el-menu-item.no-hover-bg) {
  &:hover,
  &.is-active,
  &::after,
  &:focus,
  &:active {
    background-color: transparent;
  }
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background: transparent;
}
</style>
