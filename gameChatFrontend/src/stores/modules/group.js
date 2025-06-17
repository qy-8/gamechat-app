import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserGroups,
  getGroupInvitations as apiGetGroupInvitations,
  groupInvitationResponse,
  kickGroupMember,
  getGroupMembers
} from '@/api/group'
import { ElMessage } from 'element-plus'

export const useGroupStore = defineStore(
  'group',
  () => {
    const groups = ref([])
    const activeGroup = ref(null)
    const activeGroupId = ref(null)
    const isGroupActive = ref(false) // private: false, group: true
    const groupInvitations = ref([])
    const unreadGroupInvitation = ref(null)
    const groupMembers = ref([])

    const setGroups = async () => {
      try {
        const response = await getUserGroups()
        groups.value = response.data
      } catch (error) {
        console.error(error)
      }
    }

    const setActiveGroup = (group) => {
      activeGroup.value = group
      activeGroupId.value = activeGroup.value._id
      isGroupActive.value = true
    }

    const getGroupInvitations = async () => {
      try {
        const response = await apiGetGroupInvitations()
        groupInvitations.value = response.data
        unreadGroupInvitation.value = groupInvitations.value.length
      } catch (error) {
        console.error(error)
      }
    }

    const handleRequestAction = async (groupId, action, invitationId) => {
      if (groupId) {
        try {
          const response = await groupInvitationResponse({
            groupId,
            action
          })
          ElMessage.success(response.message)

          groupInvitations.value = groupInvitations.value.filter(
            (invitation) => invitation._id !== invitationId
          )
          unreadGroupInvitation.value--
          if (action === 'accept') {
            groups.value.unshift(response.data)
          }
        } catch (error) {
          console.error(error)
          ElMessage.success('操作失败')
        }
      }
    }

    const handleNewRequest = (newRequestData) => {
      groupInvitations.value.unshift(newRequestData)
      unreadGroupInvitation.value++
    }

    const handleKickGroupMember = async (memberId) => {
      try {
        await kickGroupMember({
          groupId: activeGroupId.value,
          memberId
        })
        ElMessage.success('已将该用户移出群组')
        groupMembers.value = groupMembers.value.filter(
          (item) => item._id !== memberId
        )
      } catch (error) {
        console.error(error)
      }
    }

    const fetchGroupMembers = async () => {
      try {
        const response = await getGroupMembers(activeGroupId.value)
        groupMembers.value = response.data.members
        console.log(groupMembers.value)
      } catch (error) {
        console.error(error)
      }
    }

    const clearActiveGroup = () => {
      activeGroup.value = null
      isGroupActive.value = false
    }

    return {
      groups,
      isGroupActive,
      activeGroup,
      activeGroupId,
      groupInvitations,
      unreadGroupInvitation,
      groupMembers,
      setGroups,
      setActiveGroup,
      getGroupInvitations,
      handleRequestAction,
      handleNewRequest,
      handleKickGroupMember,
      fetchGroupMembers,
      clearActiveGroup
    }
  },
  {
    persist: {
      paths: ['activeGroup']
    }
  }
)
