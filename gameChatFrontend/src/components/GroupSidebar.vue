<script setup>
import { CirclePlusFilled } from '@element-plus/icons-vue'
import ThemeSwitch from '@/components/ThemeToggle.vue'
</script>

<template>
  <el-menu class="container" :collapse="true">
    <el-menu-item index="1" class="direct-message">
      <div class="direct-message-box">
        <img src="/images/photo.png" alt="私信" class="direct-message-image" />
      </div>
      <template #title>私信</template>
    </el-menu-item>
    <el-menu-item class="groupList">
      <img
        src="/images/groupImage.png"
        alt="私信"
        class="direct-message-image"
      />
      <template #title>群组1</template>
    </el-menu-item>
    <el-menu-item class="groupList">
      <img
        src="/images/groupImage.png"
        alt="私信"
        class="direct-message-image"
      />
      <template #title>群组2</template>
    </el-menu-item>
    <el-menu-item class="groupList">
      <img
        src="/images/groupImage.png"
        alt="私信"
        class="direct-message-image"
      />
      <template #title>群组3</template>
    </el-menu-item>
    <el-menu-item index="1" class="create-group">
      <el-icon><CirclePlusFilled /></el-icon>
      <template #title>创建群组</template>
    </el-menu-item>
    <el-menu-item index="1">
      <ThemeSwitch class="theme-switch" />
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss" scoped>
.container {
  padding-top: 20px;
  flex-direction: column;
  width: 90px;
  height: 100vh;
}

.container img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
}

.container .direct-message-box {
  padding-bottom: 10px;
  border-bottom: 1px solid;
}

.container .el-menu-item {
  margin-bottom: 10px;
}

.container .el-menu-item:hover {
  background-color: transparent;
}

.container .el-icon {
  width: 50px;
  height: 50px;
  font-size: 30px;
}

.container .el-icon:hover {
  background-color: var(--el-text-color-secondary);
  border-radius: 10px;
}

.el-menu-item .theme-switch {
  height: 20px;
  padding: 0;
  margin-top: -30px;
  font-size: 14px;
}

img:active,
.el-icon:active,
.theme-switch:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
</style>
