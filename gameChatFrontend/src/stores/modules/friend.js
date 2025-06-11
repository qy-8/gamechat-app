import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFriendRequestList, getFriendList } from '../../api/friend'

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

  return {
    friendList,
    friendRequestList,
    unreadRequestCount,
    getList,
    getIncomingRequests,
    clearUnreadRequestCount,
    handleNewRequest
  }
})
