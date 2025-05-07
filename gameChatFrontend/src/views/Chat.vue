<script setup>
import GroupSidebar from '../components/GroupSidebar.vue'
import GroupInfo from '../components/GroupInfo.vue'
import ChannelChat from '../components/ChannelChat.vue'
import { getUserGroups } from '../api/group'
import { onMounted, ref } from 'vue'

const groupList = ref('')

const getGroups = async () => {
  try {
    const response = await getUserGroups()
    groupList.value = response.data
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
  getGroups()
})
</script>

<template>
  <div class="container">
    <GroupSidebar :groupList="groupList" />
    <GroupInfo />
    <ChannelChat />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-home-details-box-bgc);
}
</style>
