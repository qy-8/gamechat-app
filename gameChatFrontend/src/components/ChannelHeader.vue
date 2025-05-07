<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchInputShow = ref(false)
</script>
<template>
  <div class="container">
    <div class="group-container">
      <img src="/images/background1.avif" alt="头像" class="group-img" />
      <div class="group-name">Hazelight Studios</div>
    </div>
    <div class="icon-container">
      <el-input v-show="searchInputShow" placeholder="搜索信息" />
      <div class="search icon">
        <el-icon @click="searchInputShow = !searchInputShow"
          ><Search
        /></el-icon>
      </div>
      <div class="group-members icon"><IconMdiAccountGroup class="icon" /></div>
      <div class="notifications-off icon">
        <IconIcBaselineNotificationsOff class="icon" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
div.container {
  width: 100%;
  padding: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color-group-list);
  color: var(--el-text-color-regular);
}

.container .group-img {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

.group-container .group-name {
  padding-left: 6px;
}

.group-container {
  display: flex;
  flex-direction: row;
}

div.icon-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon-container .icon {
  margin: 0 6px;
  cursor: pointer;
}

.icon-container .search {
  padding-right: 6px;
}

.icon-container .el-input {
  width: 160px;
  height: 24px;
  // border: 1px solid;
  // border-radius: 10px;
}

// 使输入框背景透明
::v-deep(.el-input__wrapper) {
  background-color: transparent;
}
</style>
