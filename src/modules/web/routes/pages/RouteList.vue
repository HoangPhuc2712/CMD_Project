<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import BaseConfirmDelete from '@/components/common/BaseConfirmDelete.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRoutesStore } from '@/modules/web/routes/routes.store'
import { deleteRouteMock, fetchRouteById, fetchScanPointsByArea } from '@/modules/web/routes/routes.api'
import type { RouteRow, ScanPointOption } from '@/modules/web/routes/routes.types'
import RouteForm, { type RouteFormMode, type RouteFormModel } from '@/modules/web/routes/components/RouteForm.vue'
import { usePagination } from '@/composables/usePagination'

const toast = useToast()
const auth = useAuthStore()
const store = useRoutesStore()
const canManage = computed(() => auth.isAdminUser && auth.canAccess('routes.manage'))
const exporting = ref(false)
const selectedRows = ref<RouteRow[] | null>(null)
const confirmDeleteVisible = ref(false)
const confirmDeleteMessage = ref('')
const confirmDeleteLoading = ref(false)
const pendingDeleteAction = ref<null | (() => Promise<void>)>(null)
const formVisible = ref(false)
const formMode = ref<RouteFormMode>('view')
const formModel = ref<RouteFormModel | null>(null)
const formSubmitting = ref(false)
const scanPointOptions = ref<ScanPointOption[]>([])
const { onPage } = usePagination({ load: () => store.load(), setFirst: (first) => store.setFirst(first), setPage: (first, rows) => store.setPage(first, rows) })

onMounted(async () => { await Promise.all([store.ensureAreaOptionsLoaded(), store.ensureRoleOptionsLoaded()]); await store.load() })
function statusLabel(value: number) { return value === 1 ? 'Active' : 'Inactive' }
function statusSeverity(value: number) { return value === 1 ? 'success' : 'secondary' }
function mapRow(row: RouteRow): RouteFormModel { return { route_id: row.route_id, route_code: row.route_code, route_name: row.route_name, area_id: row.area_id, role_id: row.role_id, route_priority: row.route_priority, route_min_minute: row.route_min_minute, route_max_minute: row.route_max_minute, details: row.details ?? [] } }
async function prepareFormOptions(areaId: number | null, roleId?: number | null) { await Promise.all([store.ensureAreaOptionsLoaded(), store.ensureRoleOptionsLoaded()]); scanPointOptions.value = await fetchScanPointsByArea(areaId, roleId) }
async function openNew() { await prepareFormOptions(store.areaOptions[0]?.value ?? null); formMode.value = 'new'; formModel.value = { route_name: '', area_id: store.areaOptions[0]?.value ?? null, role_id: store.roleOptions[0]?.value ?? null, route_priority: 1, route_min_minute: 0, route_max_minute: 0, details: [] }; formVisible.value = true }
async function openView(row: RouteRow) { const detail = (await fetchRouteById(row.route_id)) ?? row; await prepareFormOptions(detail.area_id, detail.role_id); formMode.value = 'view'; formModel.value = mapRow(detail); formVisible.value = true }
async function openEdit(row: RouteRow) { const detail = (await fetchRouteById(row.route_id)) ?? row; await prepareFormOptions(detail.area_id, detail.role_id); formMode.value = 'edit'; formModel.value = mapRow(detail); formVisible.value = true }
function openDeleteConfirm(message: string, action: () => Promise<void>) { confirmDeleteMessage.value = message; pendingDeleteAction.value = action; confirmDeleteVisible.value = true }
function closeDeleteConfirm() { confirmDeleteVisible.value = false; confirmDeleteLoading.value = false; pendingDeleteAction.value = null }
async function onConfirmDelete() { if (!pendingDeleteAction.value || confirmDeleteLoading.value) return; confirmDeleteLoading.value = true; try { await pendingDeleteAction.value(); confirmDeleteVisible.value = false; pendingDeleteAction.value = null } finally { confirmDeleteLoading.value = false } }
function onDelete(row: RouteRow) { openDeleteConfirm(`Delete ${row.route_name}?`, async () => { await deleteRouteMock({ route_id: row.route_id, actor_id: auth.user?.user_id ?? '' }); await store.load(); selectedRows.value = null; toast.add({ severity: 'success', summary: 'Deleted', detail: 'Route deleted.', life: 2000 }) }) }
function onDeleteSelected() { const rows = selectedRows.value ?? []; if (!rows.length) return; openDeleteConfirm(`Delete ${rows.length} selected route(s)?`, async () => { for (const row of rows) await deleteRouteMock({ route_id: row.route_id, actor_id: auth.user?.user_id ?? '' }); await store.load(); selectedRows.value = null; toast.add({ severity: 'success', summary: 'Deleted', detail: 'Selected routes deleted.', life: 2000 }) }) }
async function onExport() { exporting.value = true; try { const { exportRoutesXlsx } = await import('@/services/export/routes.export'); await exportRoutesXlsx({ rows: await store.getRowsForExport(), fileName: `cmd_routes_${new Date().toISOString().slice(0, 10)}.xlsx` }) } catch (e: any) { toast.add({ severity: 'error', summary: 'Error', detail: String(e?.message ?? 'Export failed.'), life: 3000 }) } finally { exporting.value = false } }
async function handleFormSubmit(payload: { submit: (actor_id: string) => Promise<void> }) { if (formSubmitting.value) return; formSubmitting.value = true; try { await payload.submit(auth.user?.user_id ?? ''); await store.load(); formVisible.value = false; formModel.value = null; selectedRows.value = null; toast.add({ severity: 'success', summary: 'Saved', detail: 'Route saved.', life: 2000 }) } catch (e: any) { toast.add({ severity: 'error', summary: 'Error', detail: String(e?.message ?? 'Failed to save route.'), life: 3000 }) } finally { formSubmitting.value = false } }
</script>

<template>
  <div class="space-y-3">
    <div><h1 class="text-[26px] font-semibold text-slate-800">Routes</h1><p class="text-sm text-slate-500">Draft route management UI for CMD.</p></div>
    <BaseDataTable v-model:modelSearch="store.searchText" title="Routes" :value="store.filteredRows" :loading="store.loading" dataKey="route_id" v-model:selection="selectedRows" :rows="store.rowsPerPage" :first="store.first" lazy :totalRecords="store.totalRecords" @clear="store.clearFilters" @page="onPage">
      <template v-if="canManage" #toolbar-start><BaseIconButton icon="pi pi-plus" label="New" size="small" severity="success" @click="openNew" /><BaseIconButton icon="pi pi-trash" label="Delete" size="small" severity="danger" outlined :disabled="!(selectedRows && selectedRows.length)" @click="onDeleteSelected" /></template>
      <template #toolbar-end><BaseIconButton icon="pi pi-file-excel" label="Export" iconClass="text-emerald-600" size="small" severity="secondary" outlined :loading="exporting" :disabled="exporting" @click="onExport" /></template>
      <Column v-if="canManage" selectionMode="multiple" style="width: 3rem" :exportable="false" sortDisabled />
      <Column field="route_code" header="Route Code" sortDisabled />
      <Column field="route_name" header="Route Name" sortDisabled />
      <Column field="area_name" header="Area" sortDisabled />
      <Column field="role_name" header="Role" sortDisabled />
      <Column field="details_count" header="Checkpoints" sortDisabled />
      <Column header="Minutes" sortDisabled><template #body="{ data }">{{ data.route_min_minute }} - {{ data.route_max_minute }}</template></Column>
      <Column header="Status" sortDisabled><template #body="{ data }"><Tag :value="statusLabel(data.route_status)" :severity="statusSeverity(data.route_status)" /></template></Column>
      <Column header="Action" :exportable="false" sortDisabled><template #body="{ data }"><div class="flex gap-2"><BaseIconButton icon="pi pi-eye" size="small" severity="info" outlined rounded @click="openView(data)" /><BaseIconButton v-if="canManage" icon="pi pi-pencil" size="small" severity="secondary" outlined rounded @click="openEdit(data)" /><BaseIconButton v-if="canManage" icon="pi pi-trash" size="small" severity="danger" outlined rounded @click="onDelete(data)" /></div></template></Column>
    </BaseDataTable>
    <BaseConfirmDelete :visible="confirmDeleteVisible" :message="confirmDeleteMessage" :loading="confirmDeleteLoading" @update:visible="confirmDeleteVisible = $event" @cancel="closeDeleteConfirm" @confirm="onConfirmDelete" />
    <RouteForm v-model:visible="formVisible" :mode="formMode" :model="formModel" :areaOptions="store.areaOptions" :roleOptions="store.roleOptions" :scanPointOptions="scanPointOptions" :loading="formSubmitting" @submit="handleFormSubmit" @close="formModel = null" />
  </div>
</template>
