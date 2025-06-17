import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getFriendRequestList,
  getFriendList,
  deleteFriend as apiDeleteFriend
} from '../../api/friend'
import { ElMessage } from 'element-plus'

export const useFriendStore = defineStore('friend', () => {
  const friendList = ref([])
  const friendRequestList = ref([])
  const unreadRequestCount = ref(0)

  const getList = async () => {
    try {
      const response = await getFriendList()
      friendList.value = response.data
    } catch (error) {
      console.error(error)
    }
  }

  const getIncomingRequests = async () => {
    try {
      const response = await getFriendRequestList()
      console.log(response)
      friendRequestList.value = response.data
      unreadRequestCount.value = friendRequestList.value.length
    } catch (error) {
      console.error(error)
    }
  }

  const clearUnreadRequestCount = async () => {
    unreadRequestCount.value = 0
  }

  const handleNewRequest = (newRequestData) => {
    friendRequestList.value.unshift(newRequestData)
    unreadRequestCount.value++
  }

  const addNewFriend = (newFriend) => {
    if (!friendList.value.some((f) => f._id === newFriend._id)) {
      friendList.value.unshift(newFriend)
    }
  }

  const deleteFriend = async (friendId) => {
    try {
      await apiDeleteFriend(friendId)
      friendList.value = friendList.value.filter((f) => f._id !== friendId)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error(error)
    }
  }

  return {
    friendList,
    friendRequestList,
    unreadRequestCount,
    getList,
    getIncomingRequests,
    clearUnreadRequestCount,
    handleNewRequest,
    addNewFriend,
    deleteFriend
  }
})
