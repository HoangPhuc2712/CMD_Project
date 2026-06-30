<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseConfirmDelete from '@/components/common/BaseConfirmDelete.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAreasStore } from '@/modules/web/areas/areas.store'
import { deleteAreaMock, fetchAreaById } from '@/modules/web/areas/areas.api'
import type { AreaRow } from '@/modules/web/areas/areas.types'
import AreaForm, {
  type AreaFormMode,
  type AreaFormModel,
} from '@/modules/web/areas/components/AreaForm.vue'
import { usePagination } from '@/composables/usePagination'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const store = useAreasStore()
const canManage = computed(() => auth.isAdminUser && auth.canAccess('areas.manage'))
const exporting = ref(false)
const selectedRows = ref<AreaRow[] | null>(null)
const confirmDeleteVisible = ref(false)
const confirmDeleteMessage = ref('')
const confirmDeleteLoading = ref(false)
const pendingDeleteAction = ref<null | (() => Promise<void>)>(null)
const formVisible = ref(false)
const formMode = ref<AreaFormMode>('view')
const formModel = ref<AreaFormModel | null>(null)
const formSubmitting = ref(false)

const { onPage } = usePagination({
  load: () => store.load(),
  setFirst: (first) => store.setFirst(first),
  setPage: (first, rows) => store.setPage(first, rows),
})

onMounted(() => store.load())

function statusLabel(value: number) {
  return value === 1 ? 'Active' : 'Inactive'
}
function statusSeverity(value: number) {
  return value === 1 ? 'success' : 'secondary'
}
function mapRow(row: AreaRow): AreaFormModel {
  return { area_id: row.area_id, area_code: row.area_code, area_name: row.area_name }
}

function goToAreaCheckpoints(row: AreaRow) {
  router.push({ name: 'checkpoints', query: { areaId: row.area_id, areaCode: row.area_code } })
}
function openNew() {
  formMode.value = 'new'
  formModel.value = { area_code: '', area_name: '' }
  formVisible.value = true
}
async function openView(row: AreaRow) {
  formMode.value = 'view'
  formModel.value = mapRow((await fetchAreaById(row.area_id)) ?? row)
  formVisible.value = true
}
async function openEdit(row: AreaRow) {
  formMode.value = 'edit'
  formModel.value = mapRow((await fetchAreaById(row.area_id)) ?? row)
  formVisible.value = true
}
function openDeleteConfirm(message: string, action: () => Promise<void>) {
  confirmDeleteMessage.value = message
  pendingDeleteAction.value = action
  confirmDeleteVisible.value = true
}
function closeDeleteConfirm() {
  confirmDeleteVisible.value = false
  confirmDeleteLoading.value = false
  pendingDeleteAction.value = null
}
async function onConfirmDelete() {
  if (!pendingDeleteAction.value || confirmDeleteLoading.value) return
  confirmDeleteLoading.value = true
  try {
    await pendingDeleteAction.value()
    confirmDeleteVisible.value = false
    pendingDeleteAction.value = null
  } finally {
    confirmDeleteLoading.value = false
  }
}

function onDelete(row: AreaRow) {
  openDeleteConfirm(`Delete ${row.area_code} - ${row.area_name}?`, async () => {
    await deleteAreaMock({ area_id: row.area_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Area deleted.', life: 2000 })
  })
}

function onDeleteSelected() {
  const rows = selectedRows.value ?? []
  if (!rows.length) return
  openDeleteConfirm(`Delete ${rows.length} selected area(s)?`, async () => {
    for (const row of rows)
      await deleteAreaMock({ area_id: row.area_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Selected areas deleted.',
      life: 2000,
    })
  })
}

async function onExport() {
  exporting.value = true
  try {
    const { exportAreasXlsx } = await import('@/services/export/areas.export')
    await exportAreasXlsx({
      rows: await store.getRowsForExport(),
      fileName: `cmd_areas_${new Date().toISOString().slice(0, 10)}.xlsx`,
    })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(e?.message ?? 'Export failed.'),
      life: 3000,
    })
  } finally {
    exporting.value = false
  }
}

async function handleFormSubmit(payload: { submit: (actor_id: string) => Promise<void> }) {
  if (formSubmitting.value) return
  formSubmitting.value = true
  try {
    await payload.submit(auth.user?.user_id ?? '')
    await store.load()
    formVisible.value = false
    formModel.value = null
    selectedRows.value = null
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Area saved.', life: 2000 })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(e?.message ?? 'Failed to save area.'),
      life: 3000,
    })
  } finally {
    formSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <h1 class="text-[26px] font-semibold text-slate-800">Areas</h1>
      <p class="text-sm text-slate-500">Draft area management UI for CMD.</p>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      title="Areas"
      :value="store.filteredRows"
      :loading="store.loading"
      dataKey="area_id"
      v-model:selection="selectedRows"
      :rows="store.rowsPerPage"
      :first="store.first"
      lazy
      :totalRecords="store.totalRecords"
      @clear="store.clearFilters"
      @page="onPage"
    >
      <template v-if="canManage" #toolbar-start>
        <BaseIconButton
          icon="pi pi-plus"
          label="New"
          size="small"
          severity="success"
          @click="openNew"
        />
        <BaseIconButton
          icon="pi pi-trash"
          label="Delete"
          size="small"
          severity="danger"
          outlined
          :disabled="!(selectedRows && selectedRows.length)"
          @click="onDeleteSelected"
        />
      </template>
      <template #toolbar-end>
        <BaseIconButton
          icon="pi pi-file-excel"
          label="Export"
          iconClass="text-emerald-600"
          size="small"
          severity="secondary"
          outlined
          :loading="exporting"
          :disabled="exporting"
          @click="onExport"
        />
      </template>
      <Column
        v-if="canManage"
        selectionMode="multiple"
        style="width: 3rem"
        :exportable="false"
        sortDisabled
      />
      <Column field="area_code" header="Area Code" sortDisabled />
      <Column field="area_name" header="Area Name" sortDisabled />
      <Column header="Checkpoints" sortDisabled>
        <template #body="{ data }"
          ><BaseButton
            :label="`View (${data.total_checkpoints ?? 0})`"
            severity="secondary"
            outlined
            @click="goToAreaCheckpoints(data)"
        /></template>
      </Column>
      <Column header="Status" sortDisabled
        ><template #body="{ data }"
          ><Tag
            :value="statusLabel(data.area_status)"
            :severity="statusSeverity(data.area_status)" /></template
      ></Column>
      <Column header="Action" :exportable="false" sortDisabled
        ><template #body="{ data }"
          ><div class="flex gap-2">
            <BaseIconButton
              icon="pi pi-eye"
              size="small"
              severity="info"
              outlined
              rounded
              @click="openView(data)"
            /><BaseIconButton
              v-if="canManage"
              icon="pi pi-pencil"
              size="small"
              severity="secondary"
              outlined
              rounded
              @click="openEdit(data)"
            /><BaseIconButton
              v-if="canManage"
              icon="pi pi-trash"
              size="small"
              severity="danger"
              outlined
              rounded
              @click="onDelete(data)"
            /></div></template
      ></Column>
    </BaseDataTable>
    <BaseConfirmDelete
      :visible="confirmDeleteVisible"
      :message="confirmDeleteMessage"
      :loading="confirmDeleteLoading"
      @update:visible="confirmDeleteVisible = $event"
      @cancel="closeDeleteConfirm"
      @confirm="onConfirmDelete"
    />
    <AreaForm
      v-model:visible="formVisible"
      :mode="formMode"
      :model="formModel"
      :loading="formSubmitting"
      @submit="handleFormSubmit"
      @close="formModel = null"
    />
  </div>
</template>
