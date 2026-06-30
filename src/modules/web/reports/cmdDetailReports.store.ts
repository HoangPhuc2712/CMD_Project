import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cmdPatrolDetailRows } from '@/mocks/cmdData'

export const usePatrolDetailReportsStore = defineStore('patrol-detail-reports', () => {
  const searchText = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const q = searchText.value.trim().toLowerCase()
    if (!q) return cmdPatrolDetailRows
    return cmdPatrolDetailRows.filter((row) =>
      [
        row.shiftName,
        row.routeName,
        row.checkpointName,
        row.patrolTime,
        row.reportBy,
        row.result,
        row.note,
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
