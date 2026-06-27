<script setup lang="ts">
import { ref } from 'vue'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseButtonGroup from '@/components/common/buttons/BaseButtonGroup.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import { useReportsStore } from '@/modules/reports/reports.store'

const store = useReportsStore()
const toast = useToast()
const router = useRouter()
const { t } = useI18n()
const exporting = ref(false)

const reportSwitchButtons = [
  {
    label: t('reportList.title'),
    icon: 'pi pi-file',
    size: 'small' as const,
    severity: 'info' as const,
    outlined: false,
    onClick: () => router.push({ name: 'reports' }),
  },
  {
    label: t('patrolDetailReport.title'),
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

async function onExport() {
  exporting.value = true
  try {
    const { exportPatrolReportXlsx } = await import('@/services/export/patrolReport.export')
    await exportPatrolReportXlsx({
      rows: await store.getRowsForExport(),
      fileName: `cmd_reports_${new Date().toISOString().slice(0, 10)}.xlsx`,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('common.exportFailed'),
      life: 2500,
    })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('reportList.title') }}</h1>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="t('reportList.title')"
      :value="store.rows"
      data-key="id"
      :loading="store.loading"
      :paginator="true"
      :rows="25"
      @clear="store.clearFilters"
    >
      <template #toolbar-start>
        <BaseButtonGroup :buttons="reportSwitchButtons" />
      </template>

      <template #toolbar-end>
        <BaseIconButton
          icon="pi pi-file-excel"
          :label="t('common.export')"
          size="small"
          severity="success"
          outlined
          :loading="exporting"
          @click="onExport"
        />
      </template>

      <Column field="routeName" :header="t('reportList.columns.routeName')" />
      <Column field="checkpointName" :header="t('reportList.columns.checkpointName')" />
      <Column field="inspectionResult" :header="t('reportList.columns.result')">
        <template #body="{ data }">
          <Tag :value="data.inspectionResult" :severity="resultSeverity(data.inspectionResult)" />
        </template>
      </Column>
      <Column field="note" :header="t('reportList.columns.note')" />
      <Column field="reportAt" :header="t('reportList.columns.reportAt')" />
      <Column field="processingStatus" :header="t('reportList.columns.status')" />
      <Column field="reportBy" :header="t('reportList.columns.reportBy')" />
    </BaseDataTable>
  </div>
</template>
