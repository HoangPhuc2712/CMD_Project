<script setup lang="ts">
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useUsersStore } from '@/modules/web/users/users.store'
import { useI18n } from 'vue-i18n'

const store = useUsersStore()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('users.title') }}</h1>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="t('users.title')"
      :value="store.rows"
      data-key="id"
      :loading="store.loading"
      :paginator="true"
      :rows="25"
      @clear="store.clearFilters"
    >
      <template #toolbar-start>
        <BaseIconButton
          icon="pi pi-plus"
          :label="t('common.add')"
          size="small"
          severity="success"
          @click="$router.push({ name: 'UserCreate' })"
        />
        <BaseIconButton
          icon="pi pi-trash"
          :label="t('common.delete')"
          size="small"
          severity="danger"
          outlined
          @click="$router.push({ name: 'UserDelete' })"
        />
      </template>
      <Column selection-mode="multiple" style="width: 3em" />
      <Column field="code" :header="t('users.columns.code')" />
      <Column field="name" :header="t('users.columns.name')" />
      <Column field="roleCode" :header="t('users.columns.role')" />
      <Column field="area" :header="t('users.columns.area')" />
      <Column field="status" :header="t('common.status')">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="data.status === 'Active' ? 'success' : 'danger'" />
        </template>
      </Column>
    </BaseDataTable>
  </div>
</template>
