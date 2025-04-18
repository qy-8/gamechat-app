<script setup>
import { ref } from 'vue'
import Register from './Register.vue'
import Login from './Login.vue'
import NavBar from '@/components/NavBar.vue'

const isLoginMode = ref(false)
</script>
<!-- auth.vue -->
<template>
  <NavBar class="nav-bar-fixed" />
  <div class="auth-container" :class="{ 'slide-register': !isLoginMode }">
    <div class="form-box login-box">
      <Login @switch="isLoginMode = false" />
    </div>
    <div class="form-box register-box">
      <Register @switch="isLoginMode = true" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color-home-details-box-bgc);
}

// 注册页面和登陆页面切换动画
.auth-container {
  width: 200%;
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(0);
}

.auth-container.slide-register {
  transform: translateX(-50%);
}

.form-box {
  width: 50%;
}
</style>
