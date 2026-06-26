export interface MockUserRow extends Record<string, unknown> {
  id: number
  code: string
  name: string
  role: string
  area: string
  status: string
}

export interface MockRoleRow extends Record<string, unknown> {
  id: number
  name: string
  permissionCount: number
  description: string
  status: string
}

export interface MockAreaRow extends Record<string, unknown> {
  id: number
  code: string
  name: string
  routeCount: number
  status: string
}

export interface MockRouteRow extends Record<string, unknown> {
  id: number
  code: string
  name: string
  area: string
  checkpointCount: number
  status: string
}

export const mockUsers: MockUserRow[] = [
  { id: 1, code: 'CMD001', name: 'CMD Administrator', role: 'Admin', area: 'Factory A', status: 'Active' },
  { id: 2, code: 'CMD002', name: 'Nguyen Van An', role: 'CMD', area: 'Factory B', status: 'Active' },
  { id: 3, code: 'CMD003', name: 'Tran Minh Bao', role: 'CMD', area: 'Warehouse', status: 'Inactive' },
]

export const mockRoles: MockRoleRow[] = [
  { id: 1, name: 'Admin', permissionCount: 12, description: 'Full template access', status: 'Active' },
  { id: 2, name: 'CMD', permissionCount: 6, description: 'Create and view CMD reports', status: 'Active' },
  { id: 3, name: 'Viewer', permissionCount: 2, description: 'Read-only report access', status: 'Active' },
]

export const mockAreas: MockAreaRow[] = [
  { id: 1, code: 'FA', name: 'Factory A', routeCount: 5, status: 'Active' },
  { id: 2, code: 'FB', name: 'Factory B', routeCount: 4, status: 'Active' },
  { id: 3, code: 'WH', name: 'Warehouse', routeCount: 3, status: 'Active' },
]

export const mockRoutes: MockRouteRow[] = [
  { id: 1, code: 'R001', name: 'Factory A - Week 1', area: 'Factory A', checkpointCount: 12, status: 'Active' },
  { id: 2, code: 'R002', name: 'Factory B - Week 1', area: 'Factory B', checkpointCount: 9, status: 'Active' },
  { id: 3, code: 'R003', name: 'Warehouse - Morning', area: 'Warehouse', checkpointCount: 6, status: 'Draft' },
]
