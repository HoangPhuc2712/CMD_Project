import type { ApiPageParams, ApiPagedResult } from '@/utils/pagination'
import type { RoleOption, UserRow } from './users.types'

type AreaOption = { label: string; value: number }
type UserInput = Omit<UserRow, '_q' | 'created_date' | 'updated_date'> & { password?: string }

const nowIso = () => new Date().toISOString()
let userSequence = 4

const roleOptions: RoleOption[] = [
  { label: 'Administrator', value: 1 },
  { label: 'CMD', value: 2 },
  { label: 'CMD Leader', value: 3 },
]

const areaOptions: AreaOption[] = [
  { label: 'Jia Hsin Vietnam', value: 1 },
  { label: 'Shimmer', value: 2 },
]

const users: UserInput[] = [
  {
    user_id: 'U001',
    user_name: 'Administrator',
    user_keyword: 'P23591 Administrator',
    user_code: 'P23591',
    user_role_id: 1,
    role_name: 'Administrator',
    role_code: 'ADMIN',
    user_area_id: 1,
    area_name: 'Jia Hsin Vietnam',
    area_code: 'JHV',
    user_status: 1,
    password: 'P23591',
  },
  {
    user_id: 'U002',
    user_name: 'CMD User 01',
    user_keyword: 'CMD001 CMD User 01',
    user_code: 'CMD001',
    user_role_id: 2,
    role_name: 'CMD',
    role_code: 'CMD',
    user_area_id: 1,
    area_name: 'Jia Hsin Vietnam',
    area_code: 'JHV',
    user_status: 1,
    password: '123456',
  },
  {
    user_id: 'U003',
    user_name: 'CMD User 02',
    user_keyword: 'CMD002 CMD User 02',
    user_code: 'CMD002',
    user_role_id: 2,
    role_name: 'CMD',
    role_code: 'CMD',
    user_area_id: 2,
    area_name: 'Shimmer',
    area_code: 'SHM',
    user_status: 1,
    password: '123456',
  },
]

function normalizeUser(row: UserInput): UserRow {
  return {
    ...row,
    created_date: nowIso(),
    updated_date: nowIso(),
    _q: `${row.user_code} ${row.user_name} ${row.role_name} ${row.area_name}`.toLowerCase(),
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

export async function fetchUserRows(params: ApiPageParams & { userKeyword?: string | null; userCode?: string | null; userRoleId?: number | null; userAreaId?: number | null } = {}): Promise<ApiPagedResult<UserRow>> {
  const q = `${params.userKeyword ?? ''} ${params.userCode ?? ''}`.trim().toLowerCase()
  let rows = users.map(normalizeUser)
  if (q) rows = rows.filter((row) => row._q.includes(q))
  if (params.userRoleId != null) rows = rows.filter((row) => row.user_role_id === Number(params.userRoleId))
  if (params.userAreaId != null) rows = rows.filter((row) => row.user_area_id === Number(params.userAreaId))
  return paginate(rows, params)
}

export async function fetchUserById(user_id: string) {
  const row = users.find((item) => item.user_id === user_id)
  return row ? normalizeUser(row) : null
}

export async function createUserMock(payload: { user_code: string; user_name: string; user_password: string; user_role_id: number; user_area_id: number; actor_id: string }) {
  const code = payload.user_code.trim()
  if (users.some((row) => row.user_code.toLowerCase() === code.toLowerCase())) throw new Error('USER_CODE_EXISTS')
  const role = roleOptions.find((item) => item.value === Number(payload.user_role_id))
  const area = areaOptions.find((item) => item.value === Number(payload.user_area_id))
  users.push({
    user_id: `U${String(userSequence++).padStart(3, '0')}`,
    user_code: code,
    user_name: payload.user_name.trim(),
    user_keyword: `${code} ${payload.user_name}`,
    user_role_id: Number(payload.user_role_id),
    role_name: role?.label ?? '',
    role_code: role?.label.toUpperCase().replace(/\s+/g, '_') ?? '',
    user_area_id: Number(payload.user_area_id),
    area_name: area?.label ?? '',
    area_code: area?.label === 'Shimmer' ? 'SHM' : 'JHV',
    user_status: 1,
    password: payload.user_password,
  })
  return true
}

export async function updateUserMock(payload: { user_id: string; user_code: string; user_name: string; user_password?: string; user_role_id: number; user_area_id: number; actor_id: string }) {
  const row = users.find((item) => item.user_id === payload.user_id)
  if (!row) return false
  const role = roleOptions.find((item) => item.value === Number(payload.user_role_id))
  const area = areaOptions.find((item) => item.value === Number(payload.user_area_id))
  row.user_code = payload.user_code.trim()
  row.user_name = payload.user_name.trim()
  row.user_keyword = `${row.user_code} ${row.user_name}`
  row.user_role_id = Number(payload.user_role_id)
  row.role_name = role?.label ?? row.role_name
  row.role_code = role?.label.toUpperCase().replace(/\s+/g, '_') ?? row.role_code
  row.user_area_id = Number(payload.user_area_id)
  row.area_name = area?.label ?? row.area_name
  row.area_code = area?.label === 'Shimmer' ? 'SHM' : 'JHV'
  if (payload.user_password) row.password = payload.user_password
  return true
}

export async function deleteUserMock(payload: { user_id: string; actor_id: string }) {
  const index = users.findIndex((row) => row.user_id === payload.user_id)
  if (index >= 0) users.splice(index, 1)
  return true
}

export async function fetchRoleOptions() {
  return roleOptions
}

export async function fetchAreaOptions() {
  return areaOptions
}

export async function validateCurrentUserPassword(payload: { user_id: string; password: string }) {
  const row = users.find((item) => item.user_id === payload.user_id)
  return !!row && row.password === payload.password
}

export async function changeCurrentUserPassword(payload: { user_id: string; user_code?: string; current_password: string; new_password: string; actor_id?: string }) {
  const row = users.find((item) => item.user_id === payload.user_id)
  if (!row || row.password !== payload.current_password) throw new Error('CURRENT_PASSWORD_INCORRECT')
  row.password = payload.new_password
  return { success: true, message: 'Password changed successfully' }
}
