<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import BaseConfirmDelete from '@/components/common/BaseConfirmDelete.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUsersStore } from '@/modules/web/users/users.store'
import { deleteUserMock, fetchUserById } from '@/modules/web/users/users.api'
import type { UserRow } from '@/modules/web/users/users.types'
import UserForm, { type UserFormMode, type UserFormModel } from '@/modules/web/users/components/UserForm.vue'
import { usePagination } from '@/composables/usePagination'

const toast = useToast()
const auth = useAuthStore()
const store = useUsersStore()
const canManage = computed(() => auth.isAdminUser && auth.canAccess('users.manage'))
const exporting = ref(false)
const selectedRows = ref<UserRow[] | null>(null)
const confirmDeleteVisible = ref(false)
const confirmDeleteMessage = ref('')
const confirmDeleteLoading = ref(false)
const pendingDeleteAction = ref<null | (() => Promise<void>)>(null)
const formVisible = ref(false)
const formMode = ref<UserFormMode>('view')
const formModel = ref<UserFormModel | null>(null)
const formSubmitting = ref(false)

const { onPage } = usePagination({ load: () => store.load(), setFirst: (first) => store.setFirst(first), setPage: (first, rows) => store.setPage(first, rows) })

onMounted(async () => { await Promise.all([store.ensureRoleOptionsLoaded(), store.ensureAreaOptionsLoaded()]); await store.load() })

function statusLabel(value: number) { return value === 1 ? 'Active' : 'Inactive' }
function statusSeverity(value: number) { return value === 1 ? 'success' : 'secondary' }
function mapRow(row: UserRow): UserFormModel { return { user_id: row.user_id, user_code: row.user_code, user_name: row.user_name, user_password: '', user_role_id: row.user_role_id, user_area_id: row.user_area_id, role_name: row.role_name, area_name: row.area_name } }
function openNew() { formMode.value = 'new'; formModel.value = { user_code: '', user_name: '', user_password: '', user_role_id: store.roleOptions[0]?.value ?? null, user_area_id: store.areaOptions[0]?.value ?? null }; formVisible.value = true }
async function openView(row: UserRow) { formMode.value = 'view'; formModel.value = mapRow((await fetchUserById(row.user_id)) ?? row); formVisible.value = true }
async function openEdit(row: UserRow) { formMode.value = 'edit'; formModel.value = mapRow((await fetchUserById(row.user_id)) ?? row); formVisible.value = true }
function openDeleteConfirm(message: string, action: () => Promise<void>) { confirmDeleteMessage.value = message; pendingDeleteAction.value = action; confirmDeleteVisible.value = true }
function closeDeleteConfirm() { confirmDeleteVisible.value = false; confirmDeleteLoading.value = false; pendingDeleteAction.value = null }
async function onConfirmDelete() { if (!pendingDeleteAction.value || confirmDeleteLoading.value) return; confirmDeleteLoading.value = true; try { await pendingDeleteAction.value(); confirmDeleteVisible.value = false; pendingDeleteAction.value = null } finally { confirmDeleteLoading.value = false } }
function onDelete(row: UserRow) { openDeleteConfirm(`Delete ${row.user_name}?`, async () => { await deleteUserMock({ user_id: row.user_id, actor_id: auth.user?.user_id ?? '' }); await store.load(); selectedRows.value = null; toast.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted.', life: 2000 }) }) }
function onDeleteSelected() { const rows = selectedRows.value ?? []; if (!rows.length) return; openDeleteConfirm(`Delete ${rows.length} selected user(s)?`, async () => { for (const row of rows) await deleteUserMock({ user_id: row.user_id, actor_id: auth.user?.user_id ?? '' }); await store.load(); selectedRows.value = null; toast.add({ severity: 'success', summary: 'Deleted', detail: 'Selected users deleted.', life: 2000 }) }) }
async function onExport() { exporting.value = true; try { const { exportUsersXlsx } = await import('@/services/export/users.export'); await exportUsersXlsx({ rows: await store.getRowsForExport(), fileName: `cmd_users_${new Date().toISOString().slice(0, 10)}.xlsx` }) } catch (e: any) { toast.add({ severity: 'error', summary: 'Error', detail: String(e?.message ?? 'Export failed.'), life: 3000 }) } finally { exporting.value = false } }
async function handleFormSubmit(payload: { submit: (actor_id: string) => Promise<void> }) { if (formSubmitting.value) return; formSubmitting.value = true; try { await payload.submit(auth.user?.user_id ?? ''); await store.load(); formVisible.value = false; formModel.value = null; selectedRows.value = null; toast.add({ severity: 'success', summary: 'Saved', detail: 'User saved.', life: 2000 }) } catch (e: any) { toast.add({ severity: 'error', summary: 'Error', detail: String(e?.message ?? 'Failed to save user.'), life: 3000 }) } finally { formSubmitting.value = false } }
</script>

<template>
  <div class="space-y-3">
    <div><h1 class="text-[26px] font-semibold text-slate-800">Users</h1><p class="text-sm text-slate-500">Draft user management UI for CMD.</p></div>
    <BaseDataTable v-model:modelSearch="store.searchText" title="Users" :value="store.filteredRows" :loading="store.loading" dataKey="user_id" v-model:selection="selectedRows" :rows="store.rowsPerPage" :first="store.first" lazy :totalRecords="store.totalRecords" @clear="store.clearFilters" @page="onPage">
      <template v-if="canManage" #toolbar-start><BaseIconButton icon="pi pi-plus" label="New" size="small" severity="success" @click="openNew" /><BaseIconButton icon="pi pi-trash" label="Delete" size="small" severity="danger" outlined :disabled="!(selectedRows && selectedRows.length)" @click="onDeleteSelected" /></template>
      <template #toolbar-end><BaseIconButton icon="pi pi-file-excel" label="Export" iconClass="text-emerald-600" size="small" severity="secondary" outlined :loading="exporting" :disabled="exporting" @click="onExport" /></template>
      <Column v-if="canManage" selectionMode="multiple" style="width: 3rem" :exportable="false" sortDisabled />
      <Column field="user_code" header="User Code" sortDisabled />
      <Column field="user_name" header="User Name" sortDisabled />
      <Column field="role_name" header="Role" sortDisabled />
      <Column field="area_name" header="Area" sortDisabled />
      <Column header="Status" sortDisabled><template #body="{ data }"><Tag :value="statusLabel(data.user_status)" :severity="statusSeverity(data.user_status)" /></template></Column>
      <Column header="Action" :exportable="false" sortDisabled><template #body="{ data }"><div class="flex gap-2"><BaseIconButton icon="pi pi-eye" size="small" severity="info" outlined rounded @click="openView(data)" /><BaseIconButton v-if="canManage" icon="pi pi-pencil" size="small" severity="secondary" outlined rounded @click="openEdit(data)" /><BaseIconButton v-if="canManage" icon="pi pi-trash" size="small" severity="danger" outlined rounded @click="onDelete(data)" /></div></template></Column>
    </BaseDataTable>
    <BaseConfirmDelete :visible="confirmDeleteVisible" :message="confirmDeleteMessage" :loading="confirmDeleteLoading" @update:visible="confirmDeleteVisible = $event" @cancel="closeDeleteConfirm" @confirm="onConfirmDelete" />
    <UserForm v-model:visible="formVisible" :mode="formMode" :model="formModel" :roleOptions="store.roleOptions" :areaOptions="store.areaOptions" :loading="formSubmitting" @submit="handleFormSubmit" @close="formModel = null" />
  </div>
</template>
