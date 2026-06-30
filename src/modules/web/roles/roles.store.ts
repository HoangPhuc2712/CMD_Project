import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdRoles } from '@/mocks/cmdData'

export const useRolesStore = defineStore('roles', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdRoles
    return cmdRoles.filter((row) =>
      [row.code, row.name, row.status].some((value) => String(value).toLowerCase().includes(q)),
    )
  })

  function clearFilters() {
    searchText.value = ''
  }

  return { searchText, loading, rows, clearFilters }
})
