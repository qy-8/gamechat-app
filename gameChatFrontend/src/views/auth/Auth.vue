<script setup>
// import { ref } from 'vue'
// import Register from './Register.vue'
// import Login from './Login.vue'
// import NavBar from '@/components/NavBar.vue'

// const isLoginMode = ref(false)
import NavBar from '@/components/NavBar.vue'
</script>
<!-- auth.vue -->
<template>
  <!-- <NavBar class="nav-bar-fixed" />
  <div class="auth-page-container" :class="{ 'slide-register': !isLoginMode }">
    <div class="form-box login-box">
      <Login @switch="isLoginMode = false" />
    </div>
    <div class="form-box register-box">
      <Register @switch="isLoginMode = true" />
    </div>
  </div> -->
  <div class="auth-page-wrapper">
    <NavBar class="nav-bar-fixed" />
    <div class="auth-page-container">
      <transition name="fade" mode="out-in">
        <el-row class="auth-content-box" v-if="$route.name === 'Login'">
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
          <el-col :span="15" class="form-panel">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </el-col>
        </el-row>

        <el-row v-else class="auth-content-box">
          <el-col :span="15" class="form-panel">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </el-col>
          <el-col :span="9" class="side-panel">
            <div class="side-info content">
              <h2>你的游戏之旅，从这里开始！</h2>
              <p class="welcome-text">
                🤝 找到游戏搭子，一起开黑冒险！ <br />🛠️ 与游戏开发者 & Mod
                创作者互动！ <br />💬 加入专属社区，分享你的创意和想法！
              </p>
              <!-- <el-button @click="$emit('switch')">登陆</el-button> -->
              <router-link to="/auth/login">
                <el-button>登陆</el-button>
              </router-link>
            </div>
          </el-col>
        </el-row>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './auth.scss' as *;

// .nav-bar-fixed {
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   z-index: 1000;
//   background: var(--el-bg-color-home-details-box-bgc);
// }

// // 注册页面和登陆页面切换动画
// .auth-container {
//   width: 200%;
//   display: flex;
//   transition: transform 0.5s ease;
//   transform: translateX(0);
// }

// .auth-container.slide-register {
//   transform: translateX(-50%);
// }

// .form-box {
//   width: 50%;
// }

.nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color-home-details-box-bgc);
}

// 注册页面和登陆页面切换动画
.auth-page-container {
  width: 100vw;
  display: flex;
  // justify-content: center; /* 水平居中 */
  // align-items: center; /* 垂直居中 */
  width: 100vw;
  min-height: 100vh;
  padding-top: 60px;
  box-sizing: border-box;
}

.auth-content-box {
  width: 100%;
  max-width: 100%; // 在小屏幕上，最大宽度为屏幕的90%
  height: calc(100vh - 60px);
  display: flex;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
