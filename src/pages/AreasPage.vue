<script setup lang="ts">
import Tag from 'primevue/tag'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { mockAreas, type MockAreaRow } from '@/mocks/masterData'

const columns: BaseTableColumn<MockAreaRow>[] = [
  { field: 'code', header: 'Area Code', minWidth: '9rem' },
  { field: 'name', header: 'Area Name', minWidth: '14rem' },
  { field: 'routeCount', header: 'Routes', minWidth: '8rem' },
  { field: 'status', header: 'Status', minWidth: '8rem' },
]
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Areas</h1>
        <p class="cmd-page-description">CMD area setup template.</p>
      </div>
    </div>

    <div class="cmd-card">
      <BaseDataTable
        :value="mockAreas"
        :columns="columns"
        data-key="id"
        size="small"
        checkbox
        grid-lines
        striped-rows
        toolbar
        pagination
        :rows="10"
      >
        <template #toolbarStart>
          <BaseButton label="New" size="small" icon="pi pi-plus" />
          <BaseButton label="Delete" size="small" icon="pi pi-trash" severity="danger" outlined />
        </template>
        <template #body-status="{ value }">
          <Tag :value="value" severity="success" />
        </template>
      </BaseDataTable>
    </div>
  </section>
</template>
