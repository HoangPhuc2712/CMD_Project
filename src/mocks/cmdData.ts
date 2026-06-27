export type CmdRole = {
  id: number
  code: string
  name: string
  status: 'Active' | 'Inactive'
}

export type CmdUser = {
  id: string
  code: string
  name: string
  roleCode: string
  area: string
  status: 'Active' | 'Inactive'
}

export type CmdArea = {
  id: number
  code: string
  name: string
  factory: string
  status: 'Active' | 'Inactive'
}

export type CmdRoute = {
  id: number
  code: string
  name: string
  area: string
  status: 'Active' | 'Inactive'
}

export type CmdReportRow = {
  id: number
  routeName: string
  checkpointName: string
  inspectionResult: 'OK' | 'NG'
  note: string
  reportAt: string
  processingStatus: 'No Action Needed' | 'Pending' | 'In Progress' | 'Completed'
  reportBy: string
}

export type CmdPatrolDetailRow = {
  id: number
  shiftKey: string
  shiftName: string
  routeName: string
  checkpointName: string
  patrolTime: string
  reportBy: string
  result: 'OK' | 'NG'
  note: string
  shiftColor: string
}

export const cmdRoles: CmdRole[] = [
  { id: 1, code: 'ADMIN', name: 'Administrator', status: 'Active' },
  { id: 2, code: 'CMD', name: 'CMD', status: 'Active' },
  { id: 3, code: 'LEADER', name: 'CMD Leader', status: 'Active' },
]

export const cmdUsers: CmdUser[] = [
  { id: 'U001', code: 'P23591', name: 'Administrator', roleCode: 'ADMIN', area: 'JHV', status: 'Active' },
  { id: 'U002', code: 'CMD001', name: 'CMD User 01', roleCode: 'CMD', area: 'JHV', status: 'Active' },
  { id: 'U003', code: 'CMD002', name: 'CMD User 02', roleCode: 'CMD', area: 'SHM', status: 'Active' },
]

export const cmdAreas: CmdArea[] = [
  { id: 1, code: 'JHV', name: 'Jia Hsin Vietnam', factory: 'JHV', status: 'Active' },
  { id: 2, code: 'SHM', name: 'Shimmer', factory: 'SHM', status: 'Active' },
]

export const cmdRoutes: CmdRoute[] = [
  { id: 1, code: 'CMD-R001', name: 'CMD Route No. 1', area: 'JHV', status: 'Active' },
  { id: 2, code: 'CMD-R002', name: 'CMD Route No. 2', area: 'JHV', status: 'Active' },
  { id: 3, code: 'CMD-R003', name: 'CMD Route No. 3', area: 'SHM', status: 'Active' },
]

export const cmdReports: CmdReportRow[] = [
  {
    id: 1,
    routeName: 'CMD Route No. 1',
    checkpointName: 'PD-02',
    inspectionResult: 'OK',
    note: 'No issue occurred',
    reportAt: '2026-06-22 08:05:12',
    processingStatus: 'No Action Needed',
    reportBy: 'CMD User 01',
  },
  {
    id: 2,
    routeName: 'CMD Route No. 1',
    checkpointName: 'Gate 1/2',
    inspectionResult: 'NG',
    note: 'Need follow-up',
    reportAt: '2026-06-22 08:18:30',
    processingStatus: 'Pending',
    reportBy: 'CMD User 01',
  },
  {
    id: 3,
    routeName: 'CMD Route No. 2',
    checkpointName: 'Warehouse A-01',
    inspectionResult: 'OK',
    note: 'No issue occurred',
    reportAt: '2026-06-22 09:04:55',
    processingStatus: 'No Action Needed',
    reportBy: 'CMD User 02',
  },
]

const SHIFT_COLORS = ['#ffeeba', '#bee5eb']

function buildShiftColorMap(rows: Omit<CmdPatrolDetailRow, 'shiftColor'>[]) {
  const orderedShiftKeys: string[] = []

  for (const row of rows) {
    if (!orderedShiftKeys.includes(row.shiftKey)) orderedShiftKeys.push(row.shiftKey)
  }

  return new Map(orderedShiftKeys.map((key, index) => [key, SHIFT_COLORS[index % SHIFT_COLORS.length]]))
}

const rawPatrolDetailRows: Omit<CmdPatrolDetailRow, 'shiftColor'>[] = [
  {
    id: 1,
    shiftKey: '2026-06-22T08:00:00_2026-06-22T09:00:00',
    shiftName: '2026-06-22 08:00 - 09:00',
    routeName: 'CMD Route No. 1',
    checkpointName: 'PD-02',
    patrolTime: '2026-06-22 08:05:12',
    reportBy: 'CMD User 01',
    result: 'OK',
    note: 'No issue occurred',
  },
  {
    id: 2,
    shiftKey: '2026-06-22T08:00:00_2026-06-22T09:00:00',
    shiftName: '2026-06-22 08:00 - 09:00',
    routeName: 'CMD Route No. 2',
    checkpointName: 'Gate 1/2',
    patrolTime: '2026-06-22 08:18:30',
    reportBy: 'CMD User 01',
    result: 'NG',
    note: 'Need follow-up',
  },
  {
    id: 3,
    shiftKey: '2026-06-22T09:00:00_2026-06-22T10:00:00',
    shiftName: '2026-06-22 09:00 - 10:00',
    routeName: 'CMD Route No. 1',
    checkpointName: 'Warehouse A-01',
    patrolTime: '2026-06-22 09:04:55',
    reportBy: 'CMD User 02',
    result: 'OK',
    note: 'No issue occurred',
  },
]

const shiftColorMap = buildShiftColorMap(rawPatrolDetailRows)

export const cmdPatrolDetailRows: CmdPatrolDetailRow[] = rawPatrolDetailRows.map((row) => ({
  ...row,
  shiftColor: shiftColorMap.get(row.shiftKey) ?? SHIFT_COLORS[0] ?? '#ffeeba',
}))
