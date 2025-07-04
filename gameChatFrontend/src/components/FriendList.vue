<script setup>
/**
 * @file FriendPanel.vue
 * @description 好友列表侧边面板组件，包含好友搜索、请求管理和好友列表展示。
 * @component FriendPanel
 */
import { onMounted, reactive, ref, computed } from 'vue'
import {
  searchFriend,
  sendFriendRequest,
  updateFriendStatus,
  getBlackList
} from '../api/friend'
import {
  ArrowDown,
  Search,
  Plus,
  DeleteFilled,
  Hide,
  View
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FriendRequestListDialog from './FriendRequestListDialog.vue'
import GroupRequestListDialog from './GroupRequestListDialog.vue'
import { useChatStore, useFriendStore, useGroupStore } from '../stores'
import { storeToRefs } from 'pinia'
import UserBadge from './common/UserBadge.vue'

const chatStore = useChatStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const { unreadGroupInvitation } = storeToRefs(groupStore)
const form = reactive({
  username: ''
})
// 表单引用
const formRef = ref(null)
// 表单验证规则
const rules = reactive({
  username: [
    { message: '', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]{3,15}$/,
      message: '',
      trigger: 'blur'
    }
  ]
})
const showSearchResult = ref(false)
const searchResult = ref({
  username: '用户名',
  avatar: '/images/defaultUserAvatar.png'
})
const searchResultIsEmpty = ref(false)
const showFriendRequestListDialog = ref(false)
const showGroupRequestListDialog = ref(false)
const showDeleteIcon = ref(false)
const showBlockIcon = ref(false)
const showBlockList = ref(false)
const loading = ref(false)
const blackList = ref([])
const friendListPanelRef = ref(null)

const { conversations } = storeToRefs(chatStore)
const { unreadRequestCount } = storeToRefs(friendStore)
const { friendList } = storeToRefs(friendStore)

// 组件挂载时获取好友列表和请求
onMounted(async () => {
  friendStore.getList()
  friendStore.getIncomingRequests()
  groupStore.getGroupInvitations()
})

/**
 * 处理用户名搜索。
 * 验证表单后，调用 API 搜索好友并更新搜索结果。
 */
const handleSearchUsername = async () => {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    try {
      const response = await searchFriend(form.username)
      searchResult.value = response.data
      if (searchResult.value.length <= 0) {
        searchResultIsEmpty.value = true
      } else {
        searchResultIsEmpty.value = false
      }
      showSearchResult.value = true
    } catch (error) {
      console.error(error)
    }
  })
}

/**
 * 计算好友列表，并附带未读消息数量。
 */
const friendsWithUnreadCount = computed(() => {
  const unreadMap = new Map()
  if (conversations.value && conversations.value.length > 0) {
    conversations.value.forEach((conv) => {
      unreadMap.set(conv.targetParticipant?._id, conv.unreadCount)
    })
  }
  return friendList.value.map((friend) => {
    return {
      ...friend,
      unreadCount: unreadMap.get(friend._id)
    }
  })
})

/**
 * 发送好友请求。
 * 如果搜索结果有效，则向目标用户发送好友请求。
 */
const handleSendFriendRequest = async () => {
  if (searchResult.value) {
    try {
      await sendFriendRequest(searchResult.value[0]._id)
      ElMessage.success('好友请求已发送！')
    } catch (error) {
      console.error(error)
    }
  } else {
    ElMessage.warning('无法发送好友请求')
  }
}

/**
 * 删除指定好友。
 * @param {string} friendId - 要删除的好友 ID。
 */
const deleteSelectedFriend = async (friendId) => {
  loading.value = true
  if (friendId) {
    await friendStore.deleteFriend(friendId)
  }
  loading.value = false
  showDeleteIcon.value = false // 隐藏删除图标
}

/**
 * 更新指定好友的状态（如拉黑或解除拉黑）。
 * @param {string} friendId - 要更新状态的好友 ID。
 * @param {'blocked' | 'friends'} status - 好友的新状态。
 */
const updateSelectedFriendStatus = async (friendId, status) => {
  loading.value = true
  if (friendId) {
    try {
      const response = await updateFriendStatus({ friendId, status })
      ElMessage.success('拉黑成功')
      await getBlockedList()
      await getList()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
      showBlockIcon.value = false
    }
  }
}

/**
 * 控制黑名单列表的显示/隐藏。
 * @param {boolean} showBlock - 是否显示黑名单。
 */
const showBlockFriends = async (showBlock) => {
  loading.value = true
  try {
    if (showBlock) {
      await getBlockedList() // 获取黑名单列表
      showBlockList.value = true
    } else {
      showBlockList.value = false
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

/**
 * 获取黑名单列表。
 */
const getBlockedList = async () => {
  try {
    const response = await getBlackList()
    blackList.value = response.data
  } catch (error) {
    console.error(error)
  }
}

/**
 * 选择好友以开始聊天。
 * @param {object} friend - 被选中的好友对象。
 */
const selectFriendForChat = (friend) => {
  chatStore.setActiveFriend(friend) // 设置活跃好友
  groupStore.clearActiveGroup() // 清除活跃群组
  chatStore.selectFriendToChat(friend) // 选择好友开始聊天
}
</script>

<template>
  <div v-loading="loading" class="container" ref="friendListPanelRef">
    <div class="title-menu-container">
      <!-- 私信相关信息 -->
      <div class="title-and-search-container">
        <!-- 私信标题 -->
        <div class="direct-message-title">我的私信</div>
        <!-- 私信菜单栏选项 开始 -->
        <el-dropdown
          placement="bottom-end"
          dropdown-class="custom-dropdown"
          size="large"
        >
          <el-icon class="has-active-scale-effect"><ArrowDown /></el-icon>

          <template #dropdown>
            <el-dropdown-menu class="group-setting-dropdown">
              <el-dropdown-item
                @click="
                  showFriendRequestListDialog = !showFriendRequestListDialog
                "
                >收到的好友请求
                <div
                  class="new-message friend-request"
                  v-if="unreadRequestCount > 0"
                >
                  {{ unreadRequestCount }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                @click="
                  showGroupRequestListDialog = !showGroupRequestListDialog
                "
                >收到的群组邀请
                <div
                  class="new-message group-invitations"
                  v-if="unreadGroupInvitation > 0"
                >
                  {{ unreadGroupInvitation }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                @click="showBlockFriends(true)"
                v-if="!showBlockList"
                >黑名单</el-dropdown-item
              >
              <el-dropdown-item divided @click="showBlockFriends(false)" v-else
                >好友列表</el-dropdown-item
              >
              <el-dropdown-item
                @click="showBlockIcon = true"
                v-if="!showBlockIcon"
                >拉黑好友</el-dropdown-item
              >
              <el-dropdown-item @click="showBlockIcon = false" v-else
                >取消拉黑好友</el-dropdown-item
              >
              <el-dropdown-item
                divided
                @click="showDeleteIcon = true"
                v-if="!showDeleteIcon"
                >删除好友</el-dropdown-item
              >
              <el-dropdown-item divided @click="showDeleteIcon = false" v-else
                >取消删除好友</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 私信菜单栏选项 结束 -->
      </div>

      <!-- 搜索相关区域（搜索功能，添加好友） -->
      <div class="search-and-result-container">
        <div class="search-friend-container">
          <!-- 搜索陌生人 -->
          <el-form :model="form" ref="formRef" :rules="rules">
            <el-form-item prop="username" class="direct-message-input">
              <el-input v-model="form.username" placeholder="搜索用户名" />
            </el-form-item>
          </el-form>
          <el-icon class="has-active-scale-effect" @click="handleSearchUsername"
            ><Search
          /></el-icon>
        </div>

        <!-- 搜索结果展示 -->
        <div class="result" v-if="showSearchResult">
          <div class="user-result-panel" v-if="!searchResultIsEmpty">
            <div class="user-container">
              <UserAvatar :src="searchResult[0].avatar" />
              <span class="username">{{
                searchResult[0].username || '用户名'
              }}</span>
            </div>
            <el-icon
              class="has-active-scale-effect"
              @click="handleSendFriendRequest"
              ><Plus
            /></el-icon>
          </div>
          <div class="empty-result-panel" v-else>未找到相关用户</div>
        </div>
      </div>

      <!-- 好友名单展示 开始-->
      <el-menu class="panel" ref="groupInfo" v-if="!showBlockList">
        <el-menu-item
          v-for="item in friendsWithUnreadCount"
          :key="item._id"
          :index="item._id"
          class="panel-item"
          @click="selectFriendForChat(item)"
        >
          <UserBadge :username="item.username" :avatar="item.avatar" />
          <div class="new-message" v-if="item.unreadCount > 0">
            {{ item.unreadCount }}
          </div>
          <el-icon
            class="has-active-scale-effect"
            @click="updateSelectedFriendStatus(item._id, 'blocked')"
            v-if="showBlockIcon"
            ><Hide
          /></el-icon>

          <el-icon
            class="deleteIcon has-active-scale-effect"
            @click="deleteSelectedFriend(item._id)"
            v-if="showDeleteIcon"
            ><DeleteFilled
          /></el-icon>
        </el-menu-item>
      </el-menu>
      <!-- 好友名单展示 结束-->

      <!-- 黑名单展示 开始-->
      <el-menu class="panel" v-if="showBlockList">
        <el-menu-item
          v-for="item in blackList"
          :key="item._id"
          :index="item._id"
          class="panel-item"
          ><span>{{ item.username }}</span>
          <el-icon
            class="has-active-scale-effect"
            @click="updateSelectedFriendStatus(item._id, 'friends')"
            ><View
          /></el-icon>
        </el-menu-item>
      </el-menu>
      <!-- 黑名单展示 结束-->

      <div class="listIsEmpty" v-if="blackList.length <= 0 && showBlockList">
        您的黑名单是空的
      </div>
      <div class="listIsEmpty" v-if="friendList.length <= 0 && !showBlockList">
        您的好友列表是空的
      </div>
    </div>
    <div class="resize-bar" @mousedown="startDragging"></div>
  </div>

  <FriendRequestListDialog
    v-model:visible="showFriendRequestListDialog"
    v-if="showFriendRequestListDialog"
  ></FriendRequestListDialog>
  <GroupRequestListDialog
    v-model:visible="showGroupRequestListDialog"
    v-if="showGroupRequestListDialog"
  />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/chat/_shared-chat-layout.scss' as *;
@use '@/assets/styles/ui-effects.scss' as *;

/*------------------------------------*\
 # 容器样式
 # 描述：定义好友面板容器的整体布局和背景。
\*------------------------------------*/
.container {
  flex-direction: row;
  color: var(--primary-text-color);
  background-color: var(--el-bg-color-group-list);
}

/*------------------------------------*\
 # 搜索结果容器高度
 # 描述：设置搜索结果区域的高度为自适应。
\*------------------------------------*/
.search-and-result-container {
  height: auto;
}

/*------------------------------------*\
 # 私信标题样式
 # 描述：定义“我的私信”标题的字体大小和颜色。
\*------------------------------------*/
.direct-message-title {
  font-size: 28px;
  color: var(--primary-text-color);
}

/*------------------------------------*\
 # 私信标题悬停样式
 # 描述：移除私信标题在鼠标悬停时的背景色。
\*------------------------------------*/
.direct-message-title:hover {
  background-color: transparent;
}

/*------------------------------------*\
 # 私信输入框边距
 # 描述：调整私信搜索输入框的下边距。
\*------------------------------------*/
.direct-message-input {
  margin-bottom: 0;
}

/*------------------------------------*\
 # 标题和搜索容器样式
 # 描述：定义标题和搜索区域的内边距。
\*------------------------------------*/
.title-and-search-container {
  padding: 10px 20px;
}

/*------------------------------------*\
 # 图标通用样式
 # 描述：设置所有 ElIcon 组件的字体大小和颜色。
\*------------------------------------*/
.el-icon {
  font-size: 20px;
  color: var(--primary-text-color);
}

/*------------------------------------*\
 # 搜索好友容器样式
 # 描述：定义搜索好友输入框和搜索按钮的布局。
\*------------------------------------*/
.search-friend-container {
  display: flex;
  align-items: center;
  height: auto;
  padding: 12px 10px 0 10px;
  padding-bottom: 13px;
}

/*------------------------------------*\
 # 搜索好友容器内图标间距
 # 描述：调整搜索好友容器内图标的左侧外边距。
\*------------------------------------*/
.search-friend-container .el-icon {
  margin-left: 16px;
}

/*------------------------------------*\
 # 搜索结果面板样式
 # 描述：定义搜索结果显示面板的定位、尺寸和背景。
\*------------------------------------*/
.result {
  position: absolute;
  display: flex;
  align-items: center;
  width: 250px;
  height: 58px;
  background-color: var(--el-bg-color-search-user-result);
  padding-right: 10px;
  color: #e0911a;
  z-index: 4;
  .el-icon {
    margin-right: 10px;
  }
}

/*------------------------------------*\
 # 用户搜索结果面板样式
 # 描述：定义搜索到用户时结果项的布局。
\*------------------------------------*/
.user-result-panel {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

/*------------------------------------*\
 # 用户信息容器样式
 # 描述：定义搜索结果中用户头像和名称的布局。
\*------------------------------------*/
.user-container {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 6px;
  color: var(--primary-text-color);

  img {
    height: 100%;
    border-radius: 50%;
  }

  span {
    margin-left: 14px;
  }
}

/*------------------------------------*\
 # 菜单项悬停样式
 # 描述：定义好友列表项在鼠标悬停时的背景颜色。
\*------------------------------------*/
.panel-item:hover {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 空搜索结果面板样式
 # 描述：定义未找到相关用户时提示文本的居中显示。
\*------------------------------------*/
.empty-result-panel {
  width: 100%;
  display: flex;
  justify-content: center;
}

/*------------------------------------*\
 # 私信输入框背景透明
 # 描述：移除私信输入框的阴影并使其背景透明。
\*------------------------------------*/
:deep(.direct-message-input .el-input .el-input__wrapper) {
  box-shadow: none;
  background-color: transparent;
}

/*------------------------------------*\
 # 搜索好友容器圆角
 # 描述：设置搜索好友容器的圆角。
\*------------------------------------*/
.search-friend-container {
  border-radius: 20px;
}

/*------------------------------------*\
 # 激活菜单项图标颜色
 # 描述：设置激活状态菜单项内图标的颜色。
\*------------------------------------*/
.el-menu-item.is-active i {
  color: var(--el-text-color-primary);
}

/*------------------------------------*\
 # 激活菜单项背景色
 # 描述：设置激活状态菜单项的背景颜色。
\*------------------------------------*/
.el-menu-item.is-active {
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 列表为空提示样式
 # 描述：定义好友或黑名单列表为空时提示文本的布局和对齐。
\*------------------------------------*/
.listIsEmpty {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/*------------------------------------*\
 # 新消息提示样式
 # 描述：定义未读消息数量标签的外观。
\*------------------------------------*/
.new-message {
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

/*------------------------------------*\
 # 消息提醒文本颜色
 # 描述：设置好友请求和群组邀请新消息提示的文本颜色。
\*------------------------------------*/
.new-message.friend-request,
.new-message.group-invitations {
  margin-left: 12px;
  color: var(--secondary-text-color);
}

/*------------------------------------*\
 # 拖拽条样式
 # 描述：定义面板右侧拖拽条的宽度和背景色。
\*------------------------------------*/
.resize-bar {
  width: 4px;
  background-color: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 菜单边框
 # 描述：移除 Element Plus 菜单的默认边框。
\*------------------------------------*/
.el-menu {
  border: none;
}
</style>
