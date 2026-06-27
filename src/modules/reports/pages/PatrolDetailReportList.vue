<script setup lang="ts">
import { ref, type CSSProperties } from 'vue'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseButtonGroup from '@/components/common/buttons/BaseButtonGroup.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import { usePatrolDetailReportsStore } from '@/modules/reports/patrolDetailReports.store'

const store = usePatrolDetailReportsStore()
const toast = useToast()
const router = useRouter()
const { t } = useI18n()
const exporting = ref(false)

const reportSwitchButtons = [
  {
    label: t('reportList.title'),
    icon: 'pi pi-file',
    size: 'small' as const,
    severity: 'secondary' as const,
    outlined: true,
    onClick: () => router.push({ name: 'reports' }),
  },
  {
    label: t('patrolDetailReport.title'),
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
      <h1 class="text-2xl font-bold text-slate-900">{{ t('patrolDetailReport.title') }}</h1>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="t('patrolDetailReport.title')"
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

      <Column
        field="shiftName"
        :header="t('patrolDetailReport.columns.shift')"
        bodyClass="relative !p-0 min-w-[220px]"
      >
        <template #body="{ data }">
          <div :style="shiftCellStyle(data.shiftColor)">
            {{ data.shiftName }}
          </div>
        </template>
      </Column>
      <Column field="routeName" :header="t('patrolDetailReport.columns.routeName')" />
      <Column field="checkpointName" :header="t('patrolDetailReport.columns.checkpointName')" />
      <Column field="patrolTime" :header="t('patrolDetailReport.columns.patrolTime')" />
      <Column field="reportBy" :header="t('patrolDetailReport.columns.reportBy')" />
      <Column field="result" :header="t('patrolDetailReport.columns.result')">
        <template #body="{ data }">
          <Tag :value="data.result" :severity="resultSeverity(data.result)" />
        </template>
      </Column>
      <Column field="note" :header="t('patrolDetailReport.columns.note')" />
    </BaseDataTable>
  </div>
</template>
