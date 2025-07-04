<script setup>
/**
 * @file Header.vue
 * @description 应用程序的通用头部导航栏组件，包含站点Logo、导航链接和主题切换功能。
 * @component Header
 */
import ChatIcon from '../components/GameChatIcon.vue'
import { useThemeStore } from '@/stores/modules/themeStore'
import ThemeSwitch from '@/components/ThemeToggle.vue'

const themeStore = useThemeStore()
// 初始化主题设置
themeStore.initTheme()
</script>

<template>
  <div class="container">
    <!-- 导航栏 -->
    <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
      <!-- svg logo -->
      <el-menu-item class="no-hover-bg" @click="$router.push('/')">
        <span class="logo">
          <ChatIcon />
        </span>
        GameChat
      </el-menu-item>

      <!-- 其他菜单项 -->
      <el-menu-item index="1" @click="$router.push('/')">探索</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/auth/register')"
        >注册</el-menu-item
      >
      <el-menu-item index="3" @click="$router.push('/auth/login')"
        >登陆</el-menu-item
      >
      <el-menu-item index="4" @click="$router.push('/chat')"
        >个人中心</el-menu-item
      >
      <el-menu-item><ThemeSwitch /></el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 容器样式
 # 描述：设置页面的最大宽度并居中显示，作为导航栏的包裹容器。
\*------------------------------------*/
.container {
  max-width: 1706px;
  margin: 0 auto;
}

/*------------------------------------*\
 # 导航栏基础样式
 # 描述：移除 Element Plus 水平导航栏的底部边框。
\*------------------------------------*/
.el-menu--horizontal {
  border-bottom: none;
}

/*------------------------------------*\
 # SVG Logo样式
 # 描述：调整 Logo SVG 图标的垂直对齐和右侧间距。
\*------------------------------------*/
.logo svg {
  vertical-align: middle;
  margin-right: 8px;
}

/*------------------------------------*\
 # 导航项对齐
 # 描述：使除了第一个菜单项（Logo）之外的其他菜单项整体靠右对齐。
\*------------------------------------*/
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

/*------------------------------------*\
 # Logo区域悬停/激活样式覆盖
 # 描述：确保 Logo 区域在任何交互状态下背景都保持透明，不受 Element Plus 默认样式影响。
\*------------------------------------*/
:deep(.el-menu-item.no-hover-bg) {
  &:hover,
  &.is-active,
  &::after,
  &:focus,
  &:active {
    background-color: transparent;
  }
}

/*------------------------------------*\
 # 菜单项悬停/焦点样式
 # 描述：设置导航菜单项在鼠标悬停或聚焦时背景透明。
\*------------------------------------*/
.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background: transparent;
}
</style>
