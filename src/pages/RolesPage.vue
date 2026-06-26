<script setup lang="ts">
import Tag from 'primevue/tag'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { mockRoles, type MockRoleRow } from '@/mocks/masterData'

const columns: BaseTableColumn<MockRoleRow>[] = [
  { field: 'name', header: 'Role Name', minWidth: '11rem' },
  { field: 'permissionCount', header: 'Permissions', minWidth: '9rem' },
  { field: 'description', header: 'Description', minWidth: '18rem' },
  { field: 'status', header: 'Status', minWidth: '8rem' },
]
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Roles</h1>
        <p class="cmd-page-description">Role and permission template for CMD Web Report.</p>
      </div>
    </div>

    <div class="cmd-card">
      <div class="cmd-card-body">
        <BaseDataTable :value="mockRoles" :columns="columns" data-key="id" striped-rows toolbar pagination :rows="10">
          <template #toolbarStart>
            <BaseButton label="New" icon="pi pi-plus" />
          </template>
          <template #toolbarEnd>
            <BaseButton label="Export" icon="pi pi-download" severity="secondary" outlined />
          </template>
          <template #body-status="{ value }">
            <Tag :value="value" severity="success" />
          </template>
        </BaseDataTable>
      </div>
    </div>
  </section>
</template>
