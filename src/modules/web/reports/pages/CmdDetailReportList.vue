<script setup lang="ts">
import { ref, type CSSProperties } from 'vue'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseButtonGroup from '@/components/common/buttons/BaseButtonGroup.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import { usePatrolDetailReportsStore } from '@/modules/web/reports/cmdDetailReports.store'

const store = usePatrolDetailReportsStore()
const toast = useToast()
const router = useRouter()
const exporting = ref(false)

const reportSwitchButtons = [
  {
    label: 'Report List',
    icon: 'pi pi-file',
    size: 'small' as const,
    severity: 'secondary' as const,
    outlined: true,
    onClick: () => router.push({ name: 'reports' }),
  },
  {
    label: 'Patrol Detail',
    icon: 'pi pi-list-check',
    size: 'small' as const,
    severity: 'info' as const,
    outlined: false,
    onClick: () => router.push({ name: 'patrol-detail-reports' }),
  },
]

function resultSeverity(value: string) {
  return value === 'OK' ? 'success' : 'danger'
}
function shiftCellStyle(hex: string): CSSProperties {
  return {
    backgroundColor: hex,
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
  }
}
async function onExport() {
  exporting.value = true
  try {
    const { exportPatrolDetailReportXlsx } =
      await import('@/services/export/patrolDetailReport.export')
    await exportPatrolDetailReportXlsx({
      rows: await store.getRowsForExport(),
      fileName: `cmd_patrol_detail_${new Date().toISOString().slice(0, 10)}.xlsx`,
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
        <h1 class="text-[26px] font-bold text-slate-900">Patrol Detail Report</h1>
        <p class="text-sm text-slate-500">
          Draft detail report. Shift color logic is kept as a template.
        </p>
      </div>
      <BaseButtonGroup :buttons="reportSwitchButtons" />
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      title="Patrol Detail Report"
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
      <Column field="shiftName" header="Shift" bodyClass="relative !p-0 min-w-[220px]"
        ><template #body="{ data }"
          ><div :style="shiftCellStyle(data.shiftColor)">{{ data.shiftName }}</div></template
        ></Column
      >
      <Column field="patrolTime" header="Patrol Time" />
      <Column field="reportBy" header="Report By" />
      <Column field="result" header="Result"
        ><template #body="{ data }"
          ><Tag :value="data.result" :severity="resultSeverity(data.result)" /></template
      ></Column>
      <Column field="note" header="Note" />
    </BaseDataTable>
  </div>
</template>
