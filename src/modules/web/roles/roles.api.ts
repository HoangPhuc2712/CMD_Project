import type { ApiPageParams, ApiPagedResult } from '@/utils/pagination'
import type { MenuCategoryOption, RoleRow } from './roles.types'

type RoleInput = Omit<RoleRow, '_q' | 'created_date' | 'updated_date'>

const nowIso = () => new Date().toISOString()
let roleSequence = 4
const roleRows: RoleInput[] = [
  {
    role_id: 1,
    role_code: 'ADMIN',
    role_name: 'Administrator',
    role_hour_report: true,
    role_is_admin: true,
    role_status: 1,
    menu_ids: [1, 2, 3, 4, 5, 6],
    menu_names: ['Dashboard', 'Users', 'Roles', 'Areas', 'Routes', 'Reports'],
    menu_count: 6,
  },
  {
    role_id: 2,
    role_code: 'CMD',
    role_name: 'CMD',
    role_hour_report: true,
    role_is_admin: false,
    role_status: 1,
    menu_ids: [1, 4, 5, 6],
    menu_names: ['Dashboard', 'Areas', 'Routes', 'Reports'],
    menu_count: 4,
  },
  {
    role_id: 3,
    role_code: 'LEADER',
    role_name: 'CMD Leader',
    role_hour_report: true,
    role_is_admin: false,
    role_status: 1,
    menu_ids: [1, 2, 4, 5, 6],
    menu_names: ['Dashboard', 'Users', 'Areas', 'Routes', 'Reports'],
    menu_count: 5,
  },
]

const menuOptions: MenuCategoryOption[] = [
  { label: 'Dashboard', value: 1, code: 'DASHBOARD', priority: 1 },
  { label: 'Users', value: 2, code: 'USERS', priority: 2 },
  { label: 'Roles', value: 3, code: 'ROLES', priority: 3 },
  { label: 'Areas', value: 4, code: 'AREAS', priority: 4 },
  { label: 'Routes', value: 5, code: 'ROUTES', priority: 5 },
  { label: 'Reports', value: 6, code: 'REPORTS', priority: 6 },
]

function normalizeRole(row: RoleInput): RoleRow {
  return {
    ...row,
    created_date: nowIso(),
    updated_date: nowIso(),
    menu_count: row.menu_ids.length,
    _q: `${row.role_code} ${row.role_name} ${row.menu_names.join(' ')}`.toLowerCase(),
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

export async function fetchMenuCategoryOptions(): Promise<MenuCategoryOption[]> {
  return menuOptions
}

export async function fetchRoleRowsPaged(params: ApiPageParams = {}): Promise<ApiPagedResult<RoleRow>> {
  return paginate(roleRows.map(normalizeRole), params)
}

export async function fetchRoleRows(): Promise<RoleRow[]> {
  return roleRows.map(normalizeRole)
}

export async function fetchRoleById(role_id: number) {
  const row = roleRows.find((item) => item.role_id === role_id)
  return row ? normalizeRole(row) : null
}

export async function createRole(payload: { role_code?: string; role_name: string; role_hour_report: boolean; role_is_admin: boolean; menu_ids?: number[]; mc_ids?: number[]; actor_id: string }) {
  const roleId = roleSequence++
  const selectedMenus = menuOptions.filter((item) => (payload.menu_ids ?? payload.mc_ids ?? []).includes(item.value))
  roleRows.push({
    role_id: roleId,
    role_code: payload.role_code?.trim() || `ROLE${String(roleId).padStart(3, '0')}`,
    role_name: payload.role_name.trim(),
    role_hour_report: Boolean(payload.role_hour_report),
    role_is_admin: Boolean(payload.role_is_admin),
    role_status: 1,
    menu_ids: [...(payload.menu_ids ?? payload.mc_ids ?? [])],
    menu_names: selectedMenus.map((item) => item.label),
    menu_count: selectedMenus.length,
  })
  return true
}

export async function updateRole(payload: { role_id: number; role_code?: string; role_name: string; role_hour_report: boolean; role_is_admin: boolean; menu_ids?: number[]; mc_ids?: number[]; actor_id: string }) {
  const row = roleRows.find((item) => item.role_id === payload.role_id)
  if (!row) return false
  const selectedMenus = menuOptions.filter((item) => (payload.menu_ids ?? payload.mc_ids ?? []).includes(item.value))
  row.role_code = payload.role_code?.trim() || row.role_code
  row.role_name = payload.role_name.trim()
  row.role_hour_report = Boolean(payload.role_hour_report)
  row.role_is_admin = Boolean(payload.role_is_admin)
  row.menu_ids = [...(payload.menu_ids ?? payload.mc_ids ?? [])]
  row.menu_names = selectedMenus.map((item) => item.label)
  row.menu_count = selectedMenus.length
  return true
}

export async function deleteRole(payload: { role_id: number; actor_id: string }) {
  const index = roleRows.findIndex((row) => row.role_id === payload.role_id)
  if (index >= 0) roleRows.splice(index, 1)
  return true
}
