import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdAreas } from '@/mocks/cmdData'

export const useAreasStore = defineStore('areas', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdAreas
    return cmdAreas.filter((row) =>
      [row.code, row.name, row.factory, row.status].some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    )
  })

  function clearFilters() {
    searchText.value = ''
  }

  return { searchText, loading, rows, clearFilters }
})
