import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdRoutes } from '@/mocks/cmdData'

export const useRoutesStore = defineStore('routes', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdRoutes
    return cmdRoutes.filter((row) =>
      [row.code, row.name, row.area, row.status].some((value) => String(value).toLowerCase().includes(q)),
    )
  })

  function clearFilters() {
    searchText.value = ''
  }

  return { searchText, loading, rows, clearFilters }
})
