<script setup lang="ts">
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useRoutesStore } from '@/modules/web/routes/routes.store'
import { useI18n } from 'vue-i18n'

const store = useRoutesStore()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('routes.title') }}</h1>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="t('routes.title')"
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
          @click="$router.push({ name: 'RouteCreate' })"
        />
        <BaseIconButton
          icon="pi pi-trash"
          :label="t('common.delete')"
          size="small"
          severity="danger"
          outlined
          @click="$router.push({ name: 'RouteDelete' })"
        />
      </template>
      <Column selection-mode="multiple" style="width: 3em" />
      <Column field="code" :header="t('routes.columns.code')" />
      <Column field="name" :header="t('routes.columns.name')" />
      <Column field="area" :header="t('routes.columns.area')" />
      <Column field="status" :header="t('common.status')">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="data.status === 'Active' ? 'success' : 'danger'" />
        </template>
      </Column>
    </BaseDataTable>
  </div>
</template>
