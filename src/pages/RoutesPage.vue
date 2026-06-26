<script setup lang="ts">
import Tag from 'primevue/tag'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { mockRoutes, type MockRouteRow } from '@/mocks/masterData'

const columns: BaseTableColumn<MockRouteRow>[] = [
  { field: 'code', header: 'Route Code', minWidth: '9rem' },
  { field: 'name', header: 'Route Name', minWidth: '16rem' },
  { field: 'area', header: 'Area', minWidth: '10rem' },
  { field: 'checkpointCount', header: 'Checkpoints', minWidth: '10rem' },
  { field: 'status', header: 'Status', minWidth: '8rem' },
]
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Routes</h1>
        <p class="cmd-page-description">Route template, ready for CMD-specific checkpoints later.</p>
      </div>
    </div>

    <div class="cmd-card">
      <div class="cmd-card-body">
        <BaseDataTable :value="mockRoutes" :columns="columns" data-key="id" striped-rows toolbar pagination :rows="10">
          <template #toolbarStart>
            <BaseButton label="New" icon="pi pi-plus" />
            <BaseButton label="Create Shift" icon="pi pi-calendar-plus" severity="secondary" outlined />
          </template>
          <template #body-status="{ value }">
            <Tag :value="value" :severity="value === 'Active' ? 'success' : 'warn'" />
          </template>
        </BaseDataTable>
      </div>
    </div>
  </section>
</template>
