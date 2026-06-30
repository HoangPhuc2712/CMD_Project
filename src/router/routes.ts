import { authRoutes } from '@/modules/web/auth/auth.routes'
import MainLayout from '@/layouts/MainLayout.vue'
import { dashboardRoutes } from '@/modules/web/dashboard/dashboard.routes'
import { usersRoutes } from '@/modules/web/users/users.routes'
import { areasRoutes } from '@/modules/web/areas/areas.routes'
import { checkpointsRoutes } from '@/modules/web/checkpoints/checkpoints.routes'
import { reportsRoutes } from '@/modules/web/reports/reports.routes'
import { rolesRoutes } from '@/modules/web/roles/roles.routes'
import { routesRoutes } from '@/modules/web/routes/routes.routes'
import { phoneRoutes } from '@/modules/mobile/phone/phone.routes'
import { getDefaultPlatformRoute } from '@/services/platform/platform.service'

export const routes = [
  ...authRoutes,
  ...phoneRoutes,
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        // Keep root entry platform-aware without scattering checks across pages.
        redirect: () => getDefaultPlatformRoute(),
      },
      ...dashboardRoutes,
      ...usersRoutes,
      ...rolesRoutes,
      ...areasRoutes,
      ...checkpointsRoutes,
      ...routesRoutes,
      ...reportsRoutes,
      {
        path: '401',
        name: 'forbidden',
        component: () => import('@/components/common/BaseEmptyState.vue'),
      },
      {
        path: '404',
        name: 'not-found',
        component: () => import('@/components/common/BasePageNotFound.vue'),
      },
      {
        path: ':pathMatch(.*)*',
        name: 'app-not-found',
        component: () => import('@/components/common/BasePageNotFound.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]
