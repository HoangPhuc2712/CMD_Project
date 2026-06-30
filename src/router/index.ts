import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/auth.store'

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

async function clearPageFiltersByRouteName(routeName: string | symbol | null | undefined) {
  switch (routeName) {
    case 'areas': {
      const { useAreasStore } = await import('@/modules/web/areas/areas.store')
      useAreasStore().clearFilters()
      break
    }
    case 'reports': {
      const { useReportsStore } = await import('@/modules/web/reports/reports.store')
      useReportsStore().clearFilters()
      break
    }
    case 'patrol-detail-reports': {
      const { usePatrolDetailReportsStore } = await import('@/modules/web/reports/patrolDetailReports.store')
      usePatrolDetailReportsStore().clearFilters()
      break
    }
    case 'roles': {
      const { useRolesStore } = await import('@/modules/web/roles/roles.store')
      useRolesStore().clearFilters()
      break
    }
    case 'routes': {
      const { useRoutesStore } = await import('@/modules/web/routes/routes.store')
      useRoutesStore().clearFilters()
      break
    }
    case 'users': {
      const { useUsersStore } = await import('@/modules/web/users/users.store')
      useUsersStore().clearFilters()
      break
    }
    default:
      break
  }
}

router.beforeEach(async (to) => {
  await clearPageFiltersByRouteName(to.name)

  const auth = useAuthStore()
  if (!auth.token) auth.restoreSession()

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) return { name: 'login' }

    if (auth.isTokenExpired()) {
      await auth.expireSession()
      return { name: 'login' }
    }

    if (!auth.sessionSyncedOnce) {
      const ok = await auth.syncSessionWithServer()
      if (!ok || !auth.isAuthenticated) return { name: 'login' }
    }
  }

  if (to.meta.adminOnly && !auth.isAdminUser) return { name: 'forbidden' }

  if (to.name === 'login' && auth.isAuthenticated) return { name: 'dashboard' }

  return true
})
