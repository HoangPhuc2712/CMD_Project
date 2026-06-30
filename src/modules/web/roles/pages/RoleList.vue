<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import BaseConfirmDelete from '@/components/common/BaseConfirmDelete.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRolesStore } from '@/modules/web/roles/roles.store'
import { deleteRole, fetchRoleById } from '@/modules/web/roles/roles.api'
import type { RoleRow } from '@/modules/web/roles/roles.types'
import RoleForm, {
  type RoleFormMode,
  type RoleFormModel,
} from '@/modules/web/roles/components/RoleForm.vue'
import { usePagination } from '@/composables/usePagination'

const toast = useToast()
const auth = useAuthStore()
const store = useRolesStore()
const canManage = computed(() => auth.isAdminUser && auth.canAccess('roles.manage'))
const exporting = ref(false)
const selectedRows = ref<RoleRow[] | null>(null)
const confirmDeleteVisible = ref(false)
const confirmDeleteMessage = ref('')
const confirmDeleteLoading = ref(false)
const pendingDeleteAction = ref<null | (() => Promise<void>)>(null)
const formVisible = ref(false)
const formMode = ref<RoleFormMode>('view')
const formModel = ref<RoleFormModel | null>(null)
const formSubmitting = ref(false)
const { onPage } = usePagination({
  load: () => store.load(),
  setFirst: (first) => store.setFirst(first),
  setPage: (first, rows) => store.setPage(first, rows),
})

onMounted(async () => {
  await store.ensureMenuOptionsLoaded()
  await store.load()
})
function statusLabel(value: number) {
  return value === 1 ? 'Active' : 'Inactive'
}
function statusSeverity(value: number) {
  return value === 1 ? 'success' : 'secondary'
}
function mapRow(row: RoleRow): RoleFormModel {
  return {
    role_id: row.role_id,
    role_code: row.role_code,
    role_name: row.role_name,
    role_is_admin: row.role_is_admin,
    role_hour_report: row.role_hour_report,
    menu_ids: row.menu_ids,
    menu_names: row.menu_names,
  }
}
function openNew() {
  formMode.value = 'new'
  formModel.value = {
    role_code: '',
    role_name: '',
    role_is_admin: false,
    role_hour_report: true,
    menu_ids: [],
  }
  formVisible.value = true
}
async function openView(row: RoleRow) {
  formMode.value = 'view'
  formModel.value = mapRow((await fetchRoleById(row.role_id)) ?? row)
  formVisible.value = true
}
async function openEdit(row: RoleRow) {
  formMode.value = 'edit'
  formModel.value = mapRow((await fetchRoleById(row.role_id)) ?? row)
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
function onDelete(row: RoleRow) {
  openDeleteConfirm(`Delete ${row.role_name}?`, async () => {
    await deleteRole({ role_id: row.role_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted.', life: 2000 })
  })
}
function onDeleteSelected() {
  const rows = selectedRows.value ?? []
  if (!rows.length) return
  openDeleteConfirm(`Delete ${rows.length} selected role(s)?`, async () => {
    for (const row of rows)
      await deleteRole({ role_id: row.role_id, actor_id: auth.user?.user_id ?? '' })
    await store.load()
    selectedRows.value = null
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Selected roles deleted.',
      life: 2000,
    })
  })
}
async function onExport() {
  exporting.value = true
  try {
    const { exportRolesXlsx } = await import('@/services/export/roles.export')
    await exportRolesXlsx({
      rows: await store.getRowsForExport(),
      fileName: `cmd_roles_${new Date().toISOString().slice(0, 10)}.xlsx`,
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
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Role saved.', life: 2000 })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(e?.message ?? 'Failed to save role.'),
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
      <h1 class="text-[26px] font-semibold text-slate-800">Roles</h1>
      <p class="text-sm text-slate-500">Draft role and permission UI for CMD.</p>
    </div>
    <BaseDataTable
      v-model:modelSearch="store.searchText"
      title="Roles"
      :value="store.filteredRows"
      :loading="store.loading"
      dataKey="role_id"
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
      <Column field="role_code" header="Role Code" sortDisabled />
      <Column field="role_name" header="Role Name" sortDisabled />
      <Column header="Access Menu" sortDisabled
        ><template #body="{ data }">{{ data.menu_names?.join(', ') || '-' }}</template></Column
      >
      <Column header="Status" sortDisabled
        ><template #body="{ data }"
          ><Tag
            :value="statusLabel(data.role_status)"
            :severity="statusSeverity(data.role_status)" /></template
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
    <RoleForm
      v-model:visible="formVisible"
      :mode="formMode"
      :model="formModel"
      :menuOptions="store.menuOptions"
      :loading="formSubmitting"
      @submit="handleFormSubmit"
      @close="formModel = null"
    />
  </div>
</template>
