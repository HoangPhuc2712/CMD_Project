<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import BaseConfirmDelete from '@/components/common/BaseConfirmDelete.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useCheckpointsStore } from '@/modules/web/checkpoints/checkpoints.store'
import {
  deleteCheckpointMock,
  fetchCheckpointById,
} from '@/modules/web/checkpoints/checkpoints.api'
import type { CheckpointRow } from '@/modules/web/checkpoints/checkpoints.types'
import CheckpointForm, {
  type CheckpointFormMode,
  type CheckpointFormModel,
} from '@/modules/web/checkpoints/components/CheckpointForm.vue'
import { usePagination } from '@/composables/usePagination'

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const store = useCheckpointsStore()
const canManage = computed(() => auth.isAdminUser && auth.canAccess('checkpoints.manage'))
const exporting = ref(false)
const selectedRows = ref<CheckpointRow[] | null>(null)
const confirmDeleteVisible = ref(false)
const confirmDeleteMessage = ref('')
const confirmDeleteLoading = ref(false)
const pendingDeleteAction = ref<null | (() => Promise<void>)>(null)
const formVisible = ref(false)
const formMode = ref<CheckpointFormMode>('view')
const formModel = ref<CheckpointFormModel | null>(null)
const formSubmitting = ref(false)

const lockedAreaId = computed<number | null>(() => {
  const raw = Array.isArray(route.query.areaId) ? route.query.areaId[0] : route.query.areaId
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
})
const lockedAreaCode = computed(() =>
  String(
    Array.isArray(route.query.areaCode) ? route.query.areaCode[0] : route.query.areaCode || '',
  ).trim(),
)
const pageTitle = computed(() =>
  lockedAreaCode.value ? `${lockedAreaCode.value} Checkpoints` : 'Checkpoints',
)
const { onPage } = usePagination({
  load: async () => {
    applyLockedAreaFilter()
    await store.load()
  },
  setFirst: (first) => store.setFirst(first),
  setPage: (first, rows) => store.setPage(first, rows),
})

function applyLockedAreaFilter() {
  store.filterAreaId = lockedAreaId.value
}

watch(lockedAreaId, () => {
  applyLockedAreaFilter()
  void store.load()
})
onMounted(async () => {
  await Promise.all([store.ensureAreaOptionsLoaded(), store.ensureRoleOptionsLoaded()])
  applyLockedAreaFilter()
  await store.load()
})
function statusLabel(value: number) {
  return value === 1 ? 'Active' : 'Inactive'
}
function statusSeverity(value: number) {
  return value === 1 ? 'success' : 'secondary'
}
function mapRow(row: CheckpointRow): CheckpointFormModel {
  return {
    cp_id: row.cp_id,
    cp_code: row.cp_code,
    cp_name: row.cp_name,
    cp_qr: row.cp_qr,
    cp_description: row.cp_description,
    cp_priority: row.cp_priority,
    area_id: row.area_id,
    role_ids: row.role_ids,
    role_names: row.role_names,
  }
}
function openNew() {
  formMode.value = 'new'
  formModel.value = {
    cp_code: '',
    cp_name: '',
    cp_qr: '',
    cp_description: '',
    cp_priority: 1,
    area_id: lockedAreaId.value ?? store.areaOptions[0]?.value ?? null,
    role_ids: [],
    role_names: [],
  }
  formVisible.value = true
}
async function openView(row: CheckpointRow) {
  formMode.value = 'view'
  formModel.value = mapRow(await fetchCheckpointById(row.cp_id, store.roleOptions))
  formVisible.value = true
}
async function openEdit(row: CheckpointRow) {
  formMode.value = 'edit'
  formModel.value = mapRow(await fetchCheckpointById(row.cp_id, store.roleOptions))
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
function onDelete(row: CheckpointRow) {
  openDeleteConfirm(`Delete ${row.cp_code} - ${row.cp_name}?`, async () => {
    await deleteCheckpointMock({ cp_id: row.cp_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Checkpoint deleted.',
      life: 2000,
    })
  })
}
function onDeleteSelected() {
  const rows = selectedRows.value ?? []
  if (!rows.length) return
  openDeleteConfirm(`Delete ${rows.length} selected checkpoint(s)?`, async () => {
    for (const row of rows)
      await deleteCheckpointMock({ cp_id: row.cp_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Selected checkpoints deleted.',
      life: 2000,
    })
  })
}
async function onExport() {
  exporting.value = true
  try {
    const { exportCheckpointsXlsx } = await import('@/services/export/checkpoints.export')
    await exportCheckpointsXlsx({
      rows: await store.getRowsForExport(),
      title: pageTitle.value,
      fileName: `cmd_checkpoints_${new Date().toISOString().slice(0, 10)}.xlsx`,
      includeQrImage: false,
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
    applyLockedAreaFilter()
    formVisible.value = false
    formModel.value = null
    selectedRows.value = null
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Checkpoint saved.', life: 2000 })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(e?.message ?? 'Failed to save checkpoint.'),
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
      <h1 class="text-[26px] font-semibold text-slate-800">{{ pageTitle }}</h1>
      <p class="text-sm text-slate-500">Draft checkpoint management UI for CMD.</p>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      :title="pageTitle"
      :value="store.filteredRows"
      :loading="store.loading"
      dataKey="cp_id"
      v-model:selection="selectedRows"
      :rows="store.rowsPerPage"
      :first="store.first"
      lazy
      :totalRecords="store.totalRecords"
      @clear="store.clearFilters"
      @page="onPage"
    >
      <template v-if="canManage" #toolbar-start
        ><BaseIconButton
          icon="pi pi-plus"
          label="New"
          size="small"
          severity="success"
          @click="openNew" /><BaseIconButton
          icon="pi pi-trash"
          label="Delete"
          size="small"
          severity="danger"
          outlined
          :disabled="!(selectedRows && selectedRows.length)"
          @click="onDeleteSelected"
      /></template>
      <template #toolbar-end
        ><BaseIconButton
          icon="pi pi-file-excel"
          label="Export"
          iconClass="text-emerald-600"
          size="small"
          severity="secondary"
          outlined
          :loading="exporting"
          :disabled="exporting"
          @click="onExport"
      /></template>
      <Column
        v-if="canManage"
        selectionMode="multiple"
        style="width: 3rem"
        :exportable="false"
        sortDisabled
      />
      <Column field="cp_code" header="Checkpoint Code" sortDisabled />
      <Column field="cp_name" header="Checkpoint Name" sortDisabled />
      <Column header="Area" sortDisabled
        ><template #body="{ data }"
          ><div class="flex flex-col">
            <span class="font-medium text-slate-800">{{ data.area_code }}</span
            ><span class="text-xs text-slate-500">{{ data.area_name }}</span>
          </div></template
        ></Column
      >
      <Column field="cp_description" header="Description" sortDisabled />
      <Column header="Role" sortDisabled
        ><template #body="{ data }">{{ data.role_names?.join(', ') || '-' }}</template></Column
      >
      <Column field="cp_priority" header="Priority" sortDisabled />
      <Column header="Status" sortDisabled
        ><template #body="{ data }"
          ><Tag
            :value="statusLabel(data.cp_status)"
            :severity="statusSeverity(data.cp_status)" /></template
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
    <CheckpointForm
      v-model:visible="formVisible"
      :mode="formMode"
      :model="formModel"
      :areaOptions="store.areaOptions"
      :roleOptions="store.roleOptions"
      :loading="formSubmitting"
      @submit="handleFormSubmit"
      @close="formModel = null"
    />
  </div>
</template>
