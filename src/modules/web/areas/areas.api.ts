import type { ApiPageParams, ApiPagedResult } from '@/utils/pagination'
import type { AreaRow } from './areas.types'

type AreaInput = {
  area_id: number
  area_code: string
  area_name: string
  area_status: number
  total_checkpoints?: number
}

const nowIso = () => new Date().toISOString()

let areaSequence = 3
const areaRows: AreaInput[] = [
  { area_id: 1, area_code: 'JHV', area_name: 'Jia Hsin Vietnam', area_status: 1 },
  { area_id: 2, area_code: 'SHM', area_name: 'Shimmer', area_status: 1 },
]

function normalizeArea(row: AreaInput): AreaRow {
  return {
    area_id: row.area_id,
    area_code: row.area_code,
    area_name: row.area_name,
    area_status: row.area_status,
    total_checkpoints: Number(row.total_checkpoints ?? 0),
    created_date: nowIso(),
    updated_date: nowIso(),
    _q: `${row.area_code} ${row.area_name}`.toLowerCase(),
  }
}

function paginate<T>(items: T[], params: ApiPageParams = {}): ApiPagedResult<T> {
  const totalCount = items.length
  const pageSize = Math.max(1, Number((params.pageSize ?? totalCount) || 25))
  const page = Math.max(1, Number(params.page ?? 1))
  const totalPage = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    page,
    pageSize,
    totalPage,
    hasNextPage: page < totalPage,
    hasPreviousPage: page > 1,
  }
}

export async function fetchAreaRowsPaged(params: ApiPageParams = {}): Promise<ApiPagedResult<AreaRow>> {
  return paginate(areaRows.map(normalizeArea), params)
}

export async function fetchAreaRows(): Promise<AreaRow[]> {
  return areaRows.map(normalizeArea)
}

export async function fetchAreaById(area_id: number) {
  return areaRows.find((row) => row.area_id === area_id) ? normalizeArea(areaRows.find((row) => row.area_id === area_id)!) : null
}

export async function createAreaMock(payload: { area_code: string; area_name: string; actor_id: string }) {
  const code = payload.area_code.trim()
  if (areaRows.some((row) => row.area_code.toLowerCase() === code.toLowerCase())) {
    throw new Error('AREA_CODE_EXISTS')
  }
  areaRows.push({ area_id: areaSequence++, area_code: code, area_name: payload.area_name.trim(), area_status: 1 })
  return true
}

export async function updateAreaMock(payload: { area_id: number; area_code: string; area_name: string; actor_id: string }) {
  const row = areaRows.find((item) => item.area_id === payload.area_id)
  if (!row) return false
  row.area_code = payload.area_code.trim()
  row.area_name = payload.area_name.trim()
  return true
}

export async function deleteAreaMock(payload: { area_id: number; actor_id: string }) {
  const index = areaRows.findIndex((row) => row.area_id === payload.area_id)
  if (index >= 0) areaRows.splice(index, 1)
  return true
}

export async function fetchAreaOptions() {
  return areaRows.map((row) => ({ label: row.area_name || row.area_code, value: row.area_id }))
}
