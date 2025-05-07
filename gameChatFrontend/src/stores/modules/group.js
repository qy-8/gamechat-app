import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGroupStore = defineStore(
  'group',
  () => {
    const groups = ref([])
    const activeGroup = ref(null)

    const setGroups = (newGroups) => {
      groups.value = newGroups
    }

    const setActiveGroup = (group) => {
      activeGroup.value = group
    }

    return { groups, activeGroup, setGroups, setActiveGroup }
  },
  {
    persist: {
      paths: ['activeGroup']
    }
  }
)
