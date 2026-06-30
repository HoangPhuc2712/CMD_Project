import type { ApiPageParams, ApiPagedResult } from '@/utils/pagination'
import type { AreaOption, CheckpointRow, RoleOption } from './checkpoints.types'

const nowIso = () => new Date().toISOString()
let checkpointSequence = 4

const areaOptions: AreaOption[] = [
  { label: 'Jia Hsin Vietnam', value: 1 },
  { label: 'Shimmer', value: 2 },
]

const roleOptions: RoleOption[] = [
  { label: 'CMD', value: 2 },
  { label: 'CMD Leader', value: 3 },
]

type CheckpointInput = Omit<CheckpointRow, '_q' | 'created_at' | 'updated_at'>
const checkpoints: CheckpointInput[] = [
  { cp_id: 1, cp_code: 'CP_PD02', cp_name: 'PD-02', cp_keyword: 'PD-02', cp_qr: '', cp_description: 'CMD checkpoint PD-02', cp_priority: 1, cp_status: 1, area_id: 1, area_code: 'JHV', area_name: 'Jia Hsin Vietnam', role_id_str: '2', role_ids: [2], role_names: ['CMD'] },
  { cp_id: 2, cp_code: 'CP_GATE12', cp_name: 'Gate 1/2', cp_keyword: 'Gate 1/2', cp_qr: '', cp_description: 'Main gate checkpoint', cp_priority: 2, cp_status: 1, area_id: 1, area_code: 'JHV', area_name: 'Jia Hsin Vietnam', role_id_str: '2,3', role_ids: [2, 3], role_names: ['CMD', 'CMD Leader'] },
  { cp_id: 3, cp_code: 'CP_WHA01', cp_name: 'Warehouse A-01', cp_keyword: 'Warehouse A-01', cp_qr: '', cp_description: 'Warehouse checkpoint', cp_priority: 1, cp_status: 1, area_id: 2, area_code: 'SHM', area_name: 'Shimmer', role_id_str: '2', role_ids: [2], role_names: ['CMD'] },
]

function areaCode(id: number) { return id === 2 ? 'SHM' : 'JHV' }
function areaName(id: number) { return areaOptions.find((item) => item.value === id)?.label ?? '' }
function roleNames(ids: number[]) { return ids.map((id) => roleOptions.find((item) => item.value === id)?.label ?? String(id)) }

function normalize(row: CheckpointInput): CheckpointRow {
  return {
    ...row,
    created_at: nowIso(),
    updated_at: nowIso(),
    _q: `${row.cp_code} ${row.cp_name} ${row.cp_description} ${row.area_name} ${row.role_names.join(' ')}`.toLowerCase(),
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

export async function fetchCheckpointRows(_roleOptions: RoleOption[] = [], params: ApiPageParams & { areaId?: number | null; roleIds?: number[] | null } = {}): Promise<ApiPagedResult<CheckpointRow>> {
  let rows = checkpoints.map(normalize)
  if (params.areaId != null) rows = rows.filter((row) => row.area_id === Number(params.areaId))
  if (Array.isArray(params.roleIds) && params.roleIds.length) rows = rows.filter((row) => params.roleIds!.some((id) => row.role_ids.includes(Number(id))))
  return paginate(rows, params)
}

export async function fetchCheckpointById(cp_id: number, _roleOptions: RoleOption[] = []): Promise<CheckpointRow> {
  const row = checkpoints.find((item) => item.cp_id === cp_id) ?? checkpoints[0]
  if (!row) throw new Error('CHECKPOINT_NOT_FOUND')
  return normalize(row)
}

export async function createCheckpointMock(payload: { cp_name: string; cp_description: string; cp_priority: number; area_id: number; role_ids: number[]; actor_id: string }) {
  const id = checkpointSequence++
  const roles = roleNames(payload.role_ids)
  const areaId = Number(payload.area_id)
  checkpoints.push({
    cp_id: id,
    cp_code: `CP_${String(id).padStart(4, '0')}`,
    cp_name: payload.cp_name.trim(),
    cp_keyword: payload.cp_name.trim(),
    cp_qr: '',
    cp_description: payload.cp_description.trim(),
    cp_priority: Number(payload.cp_priority ?? 1),
    cp_status: 1,
    area_id: areaId,
    area_code: areaCode(areaId),
    area_name: areaName(areaId),
    role_id_str: payload.role_ids.join(','),
    role_ids: [...payload.role_ids],
    role_names: roles,
  })
  return true
}

export async function updateCheckpointMock(payload: { cp_id: number; cp_name: string; cp_description: string; cp_priority: number; area_id: number; role_ids: number[]; actor_id: string }) {
  const row = checkpoints.find((item) => item.cp_id === payload.cp_id)
  if (!row) return false
  const areaId = Number(payload.area_id)
  row.cp_name = payload.cp_name.trim()
  row.cp_keyword = payload.cp_name.trim()
  row.cp_description = payload.cp_description.trim()
  row.cp_priority = Number(payload.cp_priority ?? 1)
  row.area_id = areaId
  row.area_code = areaCode(areaId)
  row.area_name = areaName(areaId)
  row.role_ids = [...payload.role_ids]
  row.role_id_str = payload.role_ids.join(',')
  row.role_names = roleNames(payload.role_ids)
  return true
}

export async function deleteCheckpointMock(payload: { cp_id: number; actor_id: string }) {
  const index = checkpoints.findIndex((row) => row.cp_id === payload.cp_id)
  if (index >= 0) checkpoints.splice(index, 1)
  return true
}
