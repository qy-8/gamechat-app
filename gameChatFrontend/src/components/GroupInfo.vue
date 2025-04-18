<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { ref } from 'vue'

const activeIndex = ref('1')
</script>
<template>
  <div class="container">
    <el-menu :default-active="activeIndex" class="group-info">
      <el-menu-item class="group-name">
        <div class="group-background">
          <div class="group-title">
            <span>Hazelight Studios</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
        </div>
      </el-menu-item>
      <el-menu-item index="1" class="channel-list"
        ><span>公告</span>
        <div class="new-announcements">3</div>
      </el-menu-item>
      <el-menu-item index="2" class="channel-list"
        ><span>通用</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
      <el-menu-item index="3" class="channel-list"
        ><span>伙伴</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
      <el-menu-item index="4" class="channel-list"
        ><span>mod</span>
        <div class="new-messages"><span>272</span></div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.group-info {
  width: 300px;
  padding-top: 20px;
  background-color: var(--el-bg-color-group-list);
}

.group-info .group-name {
  height: 120px;
  padding-bottom: 20px;
  border-bottom: 1px solid;
}

.group-info .group-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  background-image: url('/images/background1.avif');
  background-position: center;
  background-size: cover;
  font-size: 20px;
  border-radius: 20px;
}

.group-info .el-menu-item {
  color: var(--el-text-color-regular);
}

.group-info .el-menu-item.is-active {
  background-color: #f5f5f5;
}

.group-title {
  width: 100%;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
    to bottom,
    var(--el-bg-color-group-title-box-bgc),
    transparent
  );
  border-radius: 20px 20px 0 0;
  color: var(--el-text-color-primary);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9); //突出文字
}

.group-title .el-icon {
  margin-right: 0px;
}

.group-info .channel-list {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.channel-list .new-announcements {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--el-bg-color-announcements);
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

.channel-list .new-messages {
  font-size: 12px;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.15);
}

.new-messages span {
  color: var(--el-text-color-primary);
}

.container .el-menu-item:hover,
.group-info .el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

.container .group-name:hover {
  background-color: transparent;
}
</style>
