<script setup lang="ts">
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useAreasStore } from '@/modules/web/areas/areas.store'
import { useI18n } from 'vue-i18n'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'

const store = useAreasStore()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('areas.title') }}</h1>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="t('areas.title')"
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
          @click="$router.push({ name: 'AreaCreate' })"
        />
        <BaseIconButton
          icon="pi pi-trash"
          :label="t('common.delete')"
          size="small"
          severity="danger"
          outlined
          @click="$router.push({ name: 'AreaDelete' })"
        />
      </template>
      <Column selection-mode="multiple" style="width: 3em" />
      <Column field="code" :header="t('areas.columns.code')" />
      <Column field="name" :header="t('areas.columns.name')" />
      <Column field="factory" :header="t('areas.columns.factory')" />
      <Column field="status" :header="t('common.status')">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="data.status === 'Active' ? 'success' : 'danger'" />
        </template>
      </Column>
    </BaseDataTable>
  </div>
</template>
