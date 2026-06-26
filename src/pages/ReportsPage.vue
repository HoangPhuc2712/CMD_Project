<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Tag from 'primevue/tag'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseInput from '@/components/base/inputs/BaseInput.vue'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { mockReports, type MockReportRow } from '@/mocks/reports'

const toast = useToast()
const exporting = ref(false)
const filters = reactive({
  keyword: '',
  minIssues: null as number | null,
})

const columns: BaseTableColumn<MockReportRow>[] = [
  { field: 'reportNo', header: 'Report No.', minWidth: '13rem' },
  { field: 'reportDate', header: 'Report Date', minWidth: '10rem' },
  { field: 'reporter', header: 'Reporter', minWidth: '9rem' },
  { field: 'area', header: 'Area', minWidth: '10rem' },
  { field: 'route', header: 'Route', minWidth: '14rem' },
  { field: 'issueCount', header: 'Issues', minWidth: '8rem', align: 'center' },
  { field: 'status', header: 'Status', minWidth: '9rem' },
]

const filteredReports = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  return mockReports.filter((row) => {
    const matchKeyword = keyword
      ? [row.reportNo, row.reportDate, row.reporter, row.area, row.route, row.status]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true
    const matchIssues = filters.minIssues === null ? true : row.issueCount >= filters.minIssues
    return matchKeyword && matchIssues
  })
})

function statusSeverity(status: string) {
  if (status === 'Completed') return 'success'
  if (status === 'Pending') return 'warn'
  return 'info'
}

async function exportReports() {
  exporting.value = true
  try {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('CMD Reports')
    worksheet.columns = columns.map((column) => ({
      header: column.header,
      key: String(column.field),
      width: 22,
    }))
    filteredReports.value.forEach((row) => worksheet.addRow(row))

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cmd_reports_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Exported',
      detail: 'CMD report template exported.',
      life: 2500,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Export failed',
      detail: 'Unable to export CMD reports.',
      life: 3000,
    })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Reports</h1>
      </div>
    </div>

    <div class="cmd-card">
      <BaseDataTable
        :value="filteredReports"
        :columns="columns"
        data-key="id"
        size="small"
        checkbox
        striped-rows
        grid-lines
        toolbar
        pagination
        :rows="10"
        scrollable
      >
        <template #toolbarStart>
          <BaseInput
            v-model="filters.keyword"
            icon="pi pi-search"
            size="small"
            placeholder="Search report"
            class="w-full sm:w-64"
          />
        </template>
        <template #toolbarEnd>
          <BaseButton
            label="Export"
            icon="pi pi-download"
            size="small"
            severity="secondary"
            outlined
            :loading="exporting"
            @click="exportReports"
          />
        </template>
        <template #body-issueCount="{ value }">
          <span
            class="font-semibold"
            :class="Number(value) > 0 ? 'text-orange-600' : 'text-green-600'"
          >
            {{ value }}
          </span>
        </template>
        <template #body-status="{ value }">
          <Tag :value="value" :severity="statusSeverity(String(value))" />
        </template>
      </BaseDataTable>
    </div>
  </section>
</template>
