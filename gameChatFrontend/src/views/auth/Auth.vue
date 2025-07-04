<script setup>
/**
 * @file views/auth/auth.vue
 * @description 认证页面主布局组件，根据当前路由（登录或注册）动态显示不同的侧边信息和表单区域。
 * 包含顶部导航栏和过渡动画。
 * @component AuthPage
 */
import NavBar from '@/components/NavBar.vue' // 导入导航栏组件
</script>

<template>
  <div class="auth-page-wrapper">
    <NavBar class="nav-bar-fixed" />

    <div class="auth-page-container">
      <transition name="fade" mode="out-in">
        <!-- 登陆 开始-->
        <el-row class="auth-content-box" v-if="$route.name === 'Login'">
          <!-- 登陆侧边栏信息 -->
          <el-col :span="9">
            <div class="side-info content">
              <h2>欢迎回来，继续探索！</h2>
              <p class="welcome-text">
                ⚔️ 秀出你的高光时刻，精彩继续！ <br />🎯
                一秒进入状态，搭档们等你开场！ <br />🧩 最新 Mod
                已上线，继续你的冒险！
              </p>
              <router-link to="/auth/register">
                <el-button>注册</el-button>
              </router-link>
            </div>
          </el-col>
          <!-- 登陆表单 -->
          <el-col :span="15" class="form-panel">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </el-col>
        </el-row>

        <!-- 注册 开始-->
        <el-row v-else class="auth-content-box">
          <!-- 注册表单 -->
          <el-col :span="15" class="form-panel">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </el-col>
          <!-- 注册侧边栏信息 -->
          <el-col :span="9" class="side-panel">
            <div class="side-info content">
              <h2>你的游戏之旅，从这里开始！</h2>
              <p class="welcome-text">
                🤝 找到游戏搭子，一起开黑冒险！ <br />🛠️ 与游戏开发者 & Mod
                创作者互动！ <br />💬 加入专属社区，分享你的创意和想法！
              </p>
              <router-link to="/auth/login">
                <el-button>登陆</el-button>
              </router-link>
            </div>
          </el-col>
        </el-row>
        <!-- 注册 结束-->
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './auth.scss' as *; // 导入共享的认证样式

/*------------------------------------*\
 # 固定导航栏样式
 # 描述：设置导航栏为固定定位，并确保其层级和背景色。
\*------------------------------------*/
.nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 认证页面容器
 # 描述：定义认证页面内容的整体布局和最小高度，并处理顶部导航栏的填充。
\*------------------------------------*/
.auth-page-container {
  width: 100vw;
  display: flex;
  width: 100vw;
  min-height: 100vh;
  padding-top: 60px;
  box-sizing: border-box;
}

/*------------------------------------*\
 # 认证内容框
 # 描述：定义登录/注册内容的弹性布局容器，高度占据视口剩余空间。
\*------------------------------------*/
.auth-content-box {
  width: 100%;
  max-width: 100%; /* 在小屏幕上，最大宽度为屏幕的90% */
  height: calc(100vh - 60px);
  display: flex;
}

/*------------------------------------*\
 # 页面切换过渡动画
 # 描述：定义登录/注册页面切换时的淡入淡出过渡效果。
\*------------------------------------*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
