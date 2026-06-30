import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdReports } from '@/mocks/cmdData'

export const useReportsStore = defineStore('reports', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdReports
    return cmdReports.filter((row) =>
      [
        row.routeName,
        row.checkpointName,
        row.inspectionResult,
        row.note,
        row.reportAt,
        row.processingStatus,
        row.reportBy,
      ].some((value) => String(value).toLowerCase().includes(q)),
    )
  })

  function clearFilters() {
    searchText.value = ''
  }

  async function getRowsForExport() {
    return rows.value
  }

  return { searchText, loading, rows, clearFilters, getRowsForExport }
})
