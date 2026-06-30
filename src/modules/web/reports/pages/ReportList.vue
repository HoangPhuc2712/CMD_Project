<script setup lang="ts">
import { ref } from 'vue'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseButtonGroup from '@/components/common/buttons/BaseButtonGroup.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import ReportForm, { type ReportFormModel } from '@/modules/web/reports/components/ReportForm.vue'
import { useReportsStore } from '@/modules/web/reports/reports.store'

const store = useReportsStore()
const toast = useToast()
const router = useRouter()
const exporting = ref(false)
const detailVisible = ref(false)
const detailModel = ref<ReportFormModel | null>(null)

const reportSwitchButtons = [
  {
    label: 'Report List',
    icon: 'pi pi-file',
    size: 'small' as const,
    severity: 'info' as const,
    outlined: false,
    onClick: () => router.push({ name: 'reports' }),
  },
  {
    label: 'Patrol Detail',
    icon: 'pi pi-list-check',
    size: 'small' as const,
    severity: 'secondary' as const,
    outlined: true,
    onClick: () => router.push({ name: 'patrol-detail-reports' }),
  },
]

function resultSeverity(value: string) {
  return value === 'OK' ? 'success' : 'danger'
}
function openDetail(row: ReportFormModel) {
  detailModel.value = row
  detailVisible.value = true
}
async function onExport() {
  exporting.value = true
  try {
    const { exportPatrolReportXlsx } = await import('@/services/export/patrolReport.export')
    await exportPatrolReportXlsx({
      rows: await store.getRowsForExport(),
      fileName: `cmd_reports_${new Date().toISOString().slice(0, 10)}.xlsx`,
    })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(e?.message ?? 'Export failed.'),
      life: 2500,
    })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[26px] font-semibold text-slate-900">Report List</h1>
        <p class="text-sm text-slate-500">
          Draft CMD report table. Columns will be finalized after API is confirmed.
        </p>
      </div>
      <BaseButtonGroup :buttons="reportSwitchButtons" />
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      title="Report List"
      :value="store.rows"
      data-key="id"
      :loading="store.loading"
      :paginator="true"
      :rows="25"
      @clear="store.clearFilters"
    >
      <template #toolbar-end
        ><BaseIconButton
          icon="pi pi-file-excel"
          label="Export"
          iconClass="text-emerald-600"
          size="small"
          severity="secondary"
          outlined
          :loading="exporting"
          @click="onExport"
      /></template>
      <Column field="routeName" header="Route Name" />
      <Column field="checkpointName" header="Checkpoint" />
      <Column field="inspectionResult" header="Result"
        ><template #body="{ data }"
          ><Tag
            :value="data.inspectionResult"
            :severity="resultSeverity(data.inspectionResult)" /></template
      ></Column>
      <Column field="note" header="Note" />
      <Column field="reportAt" header="Report Date" />
      <Column field="processingStatus" header="Status" />
      <Column field="reportBy" header="Report By" />
      <Column header="Action" :exportable="false"
        ><template #body="{ data }"
          ><BaseIconButton
            icon="pi pi-eye"
            size="small"
            severity="info"
            outlined
            rounded
            @click="openDetail(data)" /></template
      ></Column>
    </BaseDataTable>
    <ReportForm
      v-model:visible="detailVisible"
      mode="view"
      :model="detailModel"
      @close="detailModel = null"
    />
  </div>
</template>
