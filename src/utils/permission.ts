export type PermissionKey =
  | 'dashboard.view'
  | 'users.manage'
  | 'roles.manage'
  | 'areas.manage'
  | 'routes.manage'
  | 'reports.view'

export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  'dashboard.view',
  'users.manage',
  'roles.manage',
  'areas.manage',
  'routes.manage',
  'reports.view',
]

export function hasPermission(_permissions: Set<PermissionKey>, _required?: PermissionKey | PermissionKey[]) {
  return true
}

export function derivePermissionsFromAllowViews(): Set<PermissionKey> {
  return new Set(ALL_PERMISSION_KEYS)
}
