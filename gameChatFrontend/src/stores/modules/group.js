/**
 * @file stores/modules/groupStore.js
 * @description Pinia Store，用于管理用户所属的群组列表、活跃群组状态、群组邀请以及群组成员操作。
 * @module GroupStore
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserGroups,
  getGroupInvitations as apiGetGroupInvitations,
  groupInvitationResponse,
  kickGroupMember,
  getGroupMembers,
  disbandGroup as apiDisbandGroup
} from '@/api/group'
import { ElMessage } from 'element-plus'
import emitter from '../../services/eventBus' // 导入全局事件总线

/**
 * @function useGroupStore
 * @description Pinia Store，用于管理用户在应用程序中的群组相关状态和操作。
 * 包含群组列表、活跃群组、群组邀请和成员管理等功能。
 * @returns {{
 * groups: Ref<Array<object>>,
 * activeGroup: Ref<object|null>,
 * activeGroupId: Ref<string|null>,
 * isGroupActive: Ref<boolean>,
 * groupInvitations: Ref<Array<object>>,
 * unreadGroupInvitation: Ref<number|null>,
 * groupMembers: Ref<Array<object>>,
 * setGroups: Function,
 * setActiveGroup: Function,
 * getGroupInvitations: Function,
 * handleRequestAction: Function,
 * handleNewRequest: Function,
 * handleKickGroupMember: Function,
 * fetchGroupMembers: Function,
 * clearActiveGroup: Function,
 * addNewGroup: Function,
 * updateGroup: Function,
 * disbandGroup: Function
 * }}
 * @property {Ref<Array<object>>} groups - 用户所属的群组列表。
 * @property {Ref<object|null>} activeGroup - 当前活跃的群组对象。
 * @property {Ref<string|null>} activeGroupId - 当前活跃群组的 ID。
 * @property {Ref<boolean>} isGroupActive - 当前是否活跃在群组（而非私聊）会话中。
 * @property {Ref<Array<object>>} groupInvitations - 用户收到的群组邀请列表。
 * @property {Ref<number|null>} unreadGroupInvitation - 未读群组邀请的数量。
 * @property {Ref<Array<object>>} groupMembers - 当前活跃群组的成员列表。
 * @property {Function} setGroups - 从后端获取并设置用户群组列表。
 * @property {Function} setActiveGroup - 设置当前活跃的群组。
 * @property {Function} getGroupInvitations - 从后端获取并更新群组邀请列表。
 * @property {Function} handleRequestAction - 处理群组邀请（接受或拒绝）。
 * @property {Function} handleNewRequest - 处理新的实时群组邀请，并发送通知。
 * @property {Function} handleKickGroupMember - 将指定成员从当前活跃群组中踢出。
 * @property {Function} fetchGroupMembers - 获取当前活跃群组的成员列表。
 * @property {Function} clearActiveGroup - 清除当前活跃群组的状态。
 * @property {Function} addNewGroup - 向群组列表中添加一个新创建的群组。
 * @property {Function} updateGroup - 更新本地活跃群组的名称和描述。
 * @property {Function} disbandGroup - 解散当前活跃的群组。
 */
export const useGroupStore = defineStore(
  'group',
  () => {
    // --- 状态 (State) ---
    /** @type {Ref<Array<object>>} */
    const groups = ref([]) // 用户所属的群组列表
    /** @type {Ref<object|null>} */
    const activeGroup = ref(null) // 当前活跃的群组对象
    /** @type {Ref<string|null>} */
    const activeGroupId = ref(null) // 当前活跃群组的 ID
    /** @type {Ref<boolean>} */
    const isGroupActive = ref(false) // 标识当前是否活跃在群组会话中 (private: false, group: true)
    /** @type {Ref<Array<object>>} */
    const groupInvitations = ref([]) // 用户收到的群组邀请列表
    /** @type {Ref<number|null>} */
    const unreadGroupInvitation = ref(null) // 未读群组邀请的数量
    /** @type {Ref<Array<object>>} */
    const groupMembers = ref([]) // 当前活跃群组的成员列表

    // Actions

    /**
     * @function setGroups
     * @description 从后端 API 获取当前用户的所有群组列表，并更新 `groups` 状态。
     * @returns {Promise<void>}
     * @throws {Error} 如果获取群组列表失败，会打印错误信息。
     */
    const setGroups = async () => {
      try {
        const response = await getUserGroups() // 调用 API 获取用户群组
        groups.value = response.data // 更新群组列表
      } catch (error) {
        console.error(error)
      }
    }

    /**
     * @function setActiveGroup
     * @description 设置当前活跃的群组，并更新相关状态。
     * @param {object} group - 要设置为活跃状态的群组对象。
     * @returns {void}
     */
    const setActiveGroup = (group) => {
      activeGroup.value = group
      activeGroupId.value = activeGroup.value._id // 更新活跃群组 ID
      isGroupActive.value = true // 标记为群组活跃
    }

    /**
     * @function getGroupInvitations
     * @description 从后端 API 获取用户收到的所有群组邀请，并更新 `groupInvitations` 状态。
     * 同时更新 `unreadGroupInvitation` 的数量。
     * @returns {Promise<void>}
     * @throws {Error} 如果获取群组邀请失败，会打印错误信息。
     */
    const getGroupInvitations = async () => {
      try {
        const response = await apiGetGroupInvitations() // 调用 API 获取群组邀请
        groupInvitations.value = response.data // 更新群组邀请列表
        unreadGroupInvitation.value = groupInvitations.value.length // 更新未读邀请数量
      } catch (error) {
        console.error('获取群组邀请失败:', error)
      }
    }

    /**
     * @function handleRequestAction
     * @description 处理群组邀请的接受或拒绝操作。
     * 成功后从邀请列表中移除该邀请，更新未读计数。如果接受，则添加到群组列表。
     * @param {string} groupId - 邀请所属的群组 ID。
     * @param {'accept' | 'decline'} action - 对邀请执行的操作（'accept' 或 'decline'）。
     * @param {string} invitationId - 邀请的 ID。
     * @returns {Promise<void>}
     * @throws {Error} 如果 API 调用失败，会打印错误信息并显示操作失败的提示。
     */
    const handleRequestAction = async (groupId, action, invitationId) => {
      if (groupId) {
        try {
          const response = await groupInvitationResponse({
            // 调用 API 响应群组邀请
            groupId,
            action
          })
          ElMessage.success(response.message)

          // 从本地邀请列表中移除已处理的邀请
          groupInvitations.value = groupInvitations.value.filter(
            (invitation) => invitation._id !== invitationId
          )
          unreadGroupInvitation.value-- // 未读数减一

          // 如果接受了邀请，将新加入的群组添加到用户群组列表中
          if (action === 'accept') {
            groups.value.unshift(response.data)
          }
        } catch (error) {
          console.error('处理群组邀请失败:', error)
          ElMessage.success('操作失败') // 显示操作失败提示
        }
      }
    }

    /**
     * @function handleNewRequest
     * @description 处理新的实时群组邀请。
     * 将新邀请添加到 `groupInvitations` 列表的开头，增加未读计数，并发送桌面通知。
     * @param {object} newRequestData - 新的群组邀请数据。
     * @param {object} newRequestData.inviter - 邀请者用户信息（包含 username）。
     * @param {object} newRequestData.group - 被邀请加入的群组信息（包含 name）。
     * @returns {void}
     */
    const handleNewRequest = (newRequestData) => {
      groupInvitations.value.unshift(newRequestData) // 添加到列表开头
      unreadGroupInvitation.value++ // 增加未读计数

      // 发送全局通知事件
      emitter.emit('show-notification', {
        title: '新的群组邀请',
        message: `用户 ${newRequestData.inviter.username} 邀请你加入群组 ${newRequestData.group.name}`
      })
    }

    /**
     * @function handleKickGroupMember
     * @description 将指定成员从当前活跃群组中踢出。
     * @param {string} memberId - 要踢出的成员的用户 ID。
     * @returns {Promise<void>}
     * @throws {Error} 如果踢出成员失败，会打印错误信息。
     */
    const handleKickGroupMember = async (memberId) => {
      try {
        await kickGroupMember({
          // 调用 API 踢出成员
          groupId: activeGroupId.value,
          memberId
        })
        ElMessage.success('已将该用户移出群组') // 显示成功提示
        // 从本地群组成员列表中移除被踢出的成员
        groupMembers.value = groupMembers.value.filter(
          (item) => item._id !== memberId
        )
      } catch (error) {
        console.error('踢出群成员失败:', error)
      }
    }

    /**
     * @function fetchGroupMembers
     * @description 获取当前活跃群组的成员列表。
     * @returns {Promise<void>}
     * @throws {Error} 如果获取成员列表失败，会打印错误信息。
     */
    const fetchGroupMembers = async () => {
      try {
        const response = await getGroupMembers(activeGroupId.value) // 调用 API 获取群组成员
        groupMembers.value = response.data.members // 更新群组成员列表
      } catch (error) {
        console.error('获取群组成员失败:', error)
      }
    }

    /**
     * @function clearActiveGroup
     * @description 清除当前活跃群组的状态，通常在切换到私聊会话时调用。
     * @returns {void}
     */
    const clearActiveGroup = () => {
      activeGroup.value = null
      isGroupActive.value = false
    }

    /**
     * @function addNewGroup
     * @description 向群组列表中添加一个新创建的群组。
     * @param {object} newGroup - 新创建的群组对象。
     * @returns {void}
     */
    const addNewGroup = (newGroup) => {
      if (newGroup) {
        groups.value.push(newGroup) // 添加新群组到列表
      }
    }

    /**
     * @function updateGroup
     * @description 更新本地活跃群组的名称和描述。
     * @param {string} groupName - 群组的新名称。
     * @param {string} groupDescription - 群组的新描述。
     * @returns {void}
     */
    const updateGroup = (groupName, groupDescription) => {
      const group = groups.value.find((g) => g._id === activeGroup.value._id)
      if (group) {
        group.name = groupName
        group.description = groupDescription
      }
      // 更新活跃群组的显示名称和描述，确保立即反映在 UI 上
      activeGroup.value.name = groupName
      activeGroup.value.description = groupDescription
    }

    /**
     * @function disbandGroup
     * @description 解散当前活跃的群组。
     * 成功后从群组列表中移除该群组，并尝试激活列表中的下一个群组。
     * @returns {Promise<void>}
     * @throws {Error} 如果解散群组失败，会打印错误信息并显示提示。
     */
    const disbandGroup = async () => {
      try {
        await apiDisbandGroup(activeGroup.value._id) // 调用 API 解散群组
        ElMessage.success('群组已成功解散！') // 显示成功提示
        // 从本地群组列表中移除已解散的群组
        groups.value = groups.value.filter(
          (group) => group._id !== activeGroup.value._id
        )

        // 替换当前激活群组
        if (groups) {
          setActiveGroup(groups.value[0])
        }
      } catch (error) {
        console.error('解散群组失败:', error)
        ElMessage.closeAll()
        ElMessage.error('解散群组失败')
      }
    }

    // --- 返回 Store 的状态和操作 ---
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
      clearActiveGroup,
      addNewGroup,
      updateGroup,
      disbandGroup
    }
  },
  {
    // Pinia 持久化配置
    persist: {
      paths: ['activeGroup']
    }
  }
)
