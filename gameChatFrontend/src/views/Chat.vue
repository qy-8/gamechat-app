<script setup>
/**
 * @file views/Chat.vue
 * @description 聊天主界面视图组件。
 * 负责渲染导航侧边栏、动态路由视图（频道/好友列表）和聊天对话区域。
 * 同时处理用户信息的获取、群组加载以及全局通知的监听。
 * @component ChatView
 */
import NavigationSidebar from '../components/NavigationSidebar.vue'
import ConversationView from '../components/ConversationView.vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { getUserInfo } from '../api/user'
import { useUserStore, useFriendStore, useGroupStore } from '../stores'
import { h } from 'vue'
import { ElNotification } from 'element-plus'
import emitter from '../services/eventBus'

const groupList = ref([])
const userStore = useUserStore()
const groupStore = useGroupStore()
const phoneNum = ref('')

/**
 * @function getPersonalInfo
 * @description 获取当前登录用户的个人信息，并更新 `userStore`。
 * 同时将用户手机号赋值给 `phoneNum` 响应式变量。
 * @returns {Promise<void>}
 * @throws {Error} 如果获取用户信息失败，错误会在控制台打印。
 */
const getPersonalInfo = async () => {
  const response = await getUserInfo()
  const { username, _id, avatar, phoneNumber } = response.data
  const necessaryData = {
    username,
    userId: _id,
    avatar
  }
  userStore.setUserInfo(necessaryData)
  phoneNum.value = phoneNumber
}

const showNotification = ({ title, message }) => {
  ElNotification({
    title,
    dangerouslyUseHTMLString: true, // 允许消息内容为 HTML 字符串
    message: h('span', { innerHTML: message }), // 使用 h 函数渲染 HTML
    duration: 5000, // 5秒后自动关闭
    position: 'top-right' // 通知显示位置
  })
}

/**
 * @lifecycle onMounted
 * @description 组件挂载后执行的逻辑。
 * - 连接 Socket.IO (注意：最佳实践中，Socket 连接可能在应用入口点更早建立)。
 * - 加载用户群组列表。
 * - 获取用户个人信息。
 * - 监听全局事件总线上的 'show-notification' 事件。
 */
onMounted(() => {
  groupStore.setGroups()
  getPersonalInfo()

  // 监听全局通知事件
  emitter.on('show-notification', showNotification)
})

/**
 * @lifecycle onUnmounted
 * @description 组件卸载前执行的逻辑。
 * - 移除全局事件总线上的 'show-notification' 事件监听器，防止内存泄漏。
 */
onUnmounted(() => {
  emitter.off('show-notification', showNotification) // 移除事件监听
})
</script>

<template>
  <div class="container">
    <NavigationSidebar :phoneNum="phoneNum" />
    <router-view></router-view>
    <ConversationView class="conversation-view" />
  </div>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 聊天主页面容器
 # 描述：定义整个聊天界面的弹性布局，使其占满整个视口高度。
\*------------------------------------*/
.container {
  display: flex;
  height: 100vh;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 聊天对话视图区域
 # 描述：设置聊天对话视图弹性占据剩余空间，并确保最小宽度为0，以适应小屏幕。
\*------------------------------------*/
.conversation-view {
  flex: 1;
  min-width: 0;
}
</style>
