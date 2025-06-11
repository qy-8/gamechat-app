import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserGroups } from '@/api/group'

export const useGroupStore = defineStore(
  'group',
  () => {
    const groups = ref([])
    const activeGroup = ref(null)
    const activeGroupId = ref(null)
    const isGroupActive = ref(false) // private: false, group: true

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

    return {
      groups,
      isGroupActive,
      activeGroup,
      activeGroupId,
      setGroups,
      setActiveGroup
    }
  },
  {
    persist: {
      paths: ['activeGroup']
    }
  }
)
