<script setup lang="ts">
import Tag from 'primevue/tag'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { mockUsers, type MockUserRow } from '@/mocks/masterData'

const columns: BaseTableColumn<MockUserRow>[] = [
  { field: 'code', header: 'User Code', minWidth: '9rem' },
  { field: 'name', header: 'User Name', minWidth: '14rem' },
  { field: 'role', header: 'Role', minWidth: '8rem' },
  { field: 'area', header: 'Area', minWidth: '10rem' },
  { field: 'status', header: 'Status', minWidth: '8rem' },
]
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Users</h1>
        <p class="cmd-page-description">User management template. Data is currently mocked.</p>
      </div>
    </div>

    <div class="cmd-card">
      <BaseDataTable
        :value="mockUsers"
        :columns="columns"
        data-key="id"
        size="small"
        grid-lines
        checkbox
        striped-rows
        toolbar
        pagination
        :rows="10"
      >
        <template #toolbarStart>
          <BaseButton label="New" size="small" icon="pi pi-plus" />
          <BaseButton label="Delete" size="small" icon="pi pi-trash" severity="danger" outlined />
        </template>
        <template #toolbarEnd>
          <BaseButton
            label="Export"
            size="small"
            icon="pi pi-download"
            severity="secondary"
            outlined
          />
        </template>
        <template #body-status="{ value }">
          <Tag :value="value" :severity="value === 'Active' ? 'success' : 'secondary'" />
        </template>
      </BaseDataTable>
    </div>
  </section>
</template>
