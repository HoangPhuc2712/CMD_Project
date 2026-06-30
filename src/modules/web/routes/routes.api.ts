import type { ApiPageParams, ApiPagedResult } from '@/utils/pagination'
import type { AreaOption, RoleOption, RouteDetailModel, RouteRow, ScanPointOption } from './routes.types'

const nowIso = () => new Date().toISOString()
let routeSequence = 3

const areaOptions: AreaOption[] = [
  { label: 'Jia Hsin Vietnam', value: 1 },
  { label: 'Shimmer', value: 2 },
]
const roleOptions: RoleOption[] = [
  { label: 'CMD', value: 2 },
  { label: 'CMD Leader', value: 3 },
]

const scanPoints: ScanPointOption[] = [
  { label: 'PD-02', value: 1, cpCode: 'CP_PD02', cpName: 'PD-02', cpPriority: 1, cpQr: '', areaId: 1 },
  { label: 'Gate 1/2', value: 2, cpCode: 'CP_GATE12', cpName: 'Gate 1/2', cpPriority: 2, cpQr: '', areaId: 1 },
  { label: 'Warehouse A-01', value: 3, cpCode: 'CP_WHA01', cpName: 'Warehouse A-01', cpPriority: 1, cpQr: '', areaId: 2 },
]

type RouteInput = Omit<RouteRow, '_q' | 'created_at' | 'updated_at'>
const routes: RouteInput[] = [
  {
    route_id: 1,
    route_code: 'CMD-R001',
    route_name: 'CMD Route No. 1',
    route_status: 1,
    route_priority: 1,
    route_max_minute: 60,
    route_min_minute: 20,
    area_id: 1,
    area_code: 'JHV',
    area_name: 'Jia Hsin Vietnam',
    role_id: 2,
    role_code: 'CMD',
    role_name: 'CMD',
    details: [
      { cp_id: 1, cp_code: 'CP_PD02', cp_name: 'PD-02', cp_qr: '', cp_priority: 1, rd_minute: 10, rd_priority: 1 },
      { cp_id: 2, cp_code: 'CP_GATE12', cp_name: 'Gate 1/2', cp_qr: '', cp_priority: 2, rd_minute: 15, rd_priority: 2 },
    ],
    details_count: 2,
  },
  {
    route_id: 2,
    route_code: 'CMD-R002',
    route_name: 'CMD Route No. 2',
    route_status: 1,
    route_priority: 2,
    route_max_minute: 60,
    route_min_minute: 20,
    area_id: 2,
    area_code: 'SHM',
    area_name: 'Shimmer',
    role_id: 2,
    role_code: 'CMD',
    role_name: 'CMD',
    details: [{ cp_id: 3, cp_code: 'CP_WHA01', cp_name: 'Warehouse A-01', cp_qr: '', cp_priority: 1, rd_minute: 10, rd_priority: 1 }],
    details_count: 1,
  },
]

function areaLabel(id: number) { return areaOptions.find((item) => item.value === id)?.label ?? '' }
function areaCode(id: number) { return id === 2 ? 'SHM' : 'JHV' }
function roleLabel(id: number) { return roleOptions.find((item) => item.value === id)?.label ?? '' }
function roleCode(id: number) { return roleLabel(id).toUpperCase().replace(/\s+/g, '_') }

function normalize(row: RouteInput): RouteRow {
  return {
    ...row,
    details_count: row.details.length,
    created_at: nowIso(),
    updated_at: nowIso(),
    _q: `${row.route_code} ${row.route_name} ${row.area_name} ${row.role_name} ${row.details.map((item) => item.cp_name).join(' ')}`.toLowerCase(),
  }
}

function paginate<T>(items: T[], params: ApiPageParams = {}): ApiPagedResult<T> {
  const totalCount = items.length
  const pageSize = Math.max(1, Number((params.pageSize ?? totalCount) || 25))
  const page = Math.max(1, Number(params.page ?? 1))
  const totalPage = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), totalCount, page, pageSize, totalPage, hasNextPage: page < totalPage, hasPreviousPage: page > 1 }
}

export async function fetchAreaOptions(): Promise<AreaOption[]> { return areaOptions }
export async function fetchRoleOptions(): Promise<RoleOption[]> { return roleOptions }

export async function fetchScanPointsByArea(areaId: number | null, roleId?: number | null): Promise<ScanPointOption[]> {
  const area = Number(areaId ?? 0)
  return scanPoints.filter((item) => !area || item.areaId === area).map((item) => ({ ...item }))
}

export async function fetchRouteRowsPaged(_roleOptions: RoleOption[] = [], params: ApiPageParams & { areaId?: number | null; roleId?: number | null; routeKeyword?: string | null; routeStatus?: number | null } = {}): Promise<ApiPagedResult<RouteRow>> {
  let rows = routes.map(normalize)
  if (params.areaId != null) rows = rows.filter((row) => row.area_id === Number(params.areaId))
  if (params.roleId != null) rows = rows.filter((row) => row.role_id === Number(params.roleId))
  return paginate(rows, params)
}

export async function fetchRouteRows(roleOptions: RoleOption[] = []): Promise<RouteRow[]> {
  return (await fetchRouteRowsPaged(roleOptions, { page: 1, pageSize: 20000 })).items
}

export async function fetchRouteById(routeId: number, _roleOptions: RoleOption[] = []) {
  const row = routes.find((item) => item.route_id === routeId)
  return row ? normalize(row) : null
}

function normalizeDetails(details: RouteDetailModel[] = []) {
  return details.map((item, index) => ({
    cp_id: item.cp_id,
    cp_code: item.cp_code,
    cp_name: item.cp_name,
    cp_qr: item.cp_qr,
    cp_priority: item.cp_priority,
    rd_minute: Number(item.rd_minute ?? 0),
    rd_priority: index + 1,
  }))
}

export async function createRouteMock(payload: { route_name: string; area_id: number; role_id: number; route_priority: number; route_min_minute: number; route_max_minute: number; details: RouteDetailModel[]; actor_id: string }) {
  const id = routeSequence++
  const areaId = Number(payload.area_id)
  const roleId = Number(payload.role_id)
  const details = normalizeDetails(payload.details)
  routes.push({
    route_id: id,
    route_code: `CMD-R${String(id).padStart(3, '0')}`,
    route_name: payload.route_name.trim(),
    route_status: 1,
    route_priority: Number(payload.route_priority ?? id),
    route_max_minute: Number(payload.route_max_minute ?? 0),
    route_min_minute: Number(payload.route_min_minute ?? 0),
    area_id: areaId,
    area_code: areaCode(areaId),
    area_name: areaLabel(areaId),
    role_id: roleId,
    role_code: roleCode(roleId),
    role_name: roleLabel(roleId),
    details,
    details_count: details.length,
  })
  return true
}

export async function updateRouteMock(payload: { route_id: number; route_name: string; area_id: number; role_id: number; route_priority: number; route_min_minute: number; route_max_minute: number; details: RouteDetailModel[]; actor_id: string }) {
  const row = routes.find((item) => item.route_id === payload.route_id)
  if (!row) return false
  const areaId = Number(payload.area_id)
  const roleId = Number(payload.role_id)
  const details = normalizeDetails(payload.details)
  row.route_name = payload.route_name.trim()
  row.route_priority = Number(payload.route_priority ?? row.route_priority)
  row.route_max_minute = Number(payload.route_max_minute ?? 0)
  row.route_min_minute = Number(payload.route_min_minute ?? 0)
  row.area_id = areaId
  row.area_code = areaCode(areaId)
  row.area_name = areaLabel(areaId)
  row.role_id = roleId
  row.role_code = roleCode(roleId)
  row.role_name = roleLabel(roleId)
  row.details = details
  row.details_count = details.length
  return true
}

export async function deleteRouteMock(payload: { route_id: number; actor_id: string }) {
  const index = routes.findIndex((row) => row.route_id === payload.route_id)
  if (index >= 0) routes.splice(index, 1)
  return true
}

export async function createPatrolShiftsByTime(_payload: { month: number; year: number; createdBy: string }): Promise<boolean> {
  return true
}
