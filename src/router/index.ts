import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/stores/auth.store'
import {
  getHomeRouteNameByPath,
  getLoginRouteNameByPath,
} from '@/services/platform/platform.service'

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
    case 'checkpoints': {
      const { useCheckpointsStore } = await import('@/modules/web/checkpoints/checkpoints.store')
      useCheckpointsStore().clearFilters()
      break
    }
    case 'reports': {
      const { useReportsStore } = await import('@/modules/web/reports/reports.store')
      useReportsStore().clearFilters()
      break
    }
    case 'patrol-detail-reports': {
      const { usePatrolDetailReportsStore } =
        await import('@/modules/web/reports/cmdDetailReports.store')
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
    if (!auth.isAuthenticated) return { name: getLoginRouteNameByPath(to.path) }

    if (auth.isTokenExpired()) {
      await auth.expireSession()
      return { name: getLoginRouteNameByPath(to.path) }
    }

    if (!auth.sessionSyncedOnce) {
      const ok = await auth.syncSessionWithServer()
      if (!ok || !auth.isAuthenticated) return { name: getLoginRouteNameByPath(to.path) }
    }
  }

  if (to.meta.adminOnly && !auth.isAdminUser) return { name: 'forbidden' }

  if ((to.name === 'login' || to.name === 'mobile-phone-login') && auth.isAuthenticated) {
    return { name: getHomeRouteNameByPath(to.path) }
  }

  return true
})
