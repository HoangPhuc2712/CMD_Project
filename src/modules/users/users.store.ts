import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdUsers } from '@/mocks/cmdData'

export const useUsersStore = defineStore('users', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdUsers
    return cmdUsers.filter((row) =>
      [row.code, row.name, row.roleCode, row.area, row.status].some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    )
  })

  function clearFilters() {
    searchText.value = ''
  }

  return { searchText, loading, rows, clearFilters }
})
