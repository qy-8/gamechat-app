<script setup>
import GroupSidebar from '../components/GroupSidebar.vue'
import GroupInfo from '../components/GroupInfo.vue'
</script>

<template>
  <div class="container">
    <GroupSidebar />
    <GroupInfo />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-home-details-box-bgc);
}
</style>
