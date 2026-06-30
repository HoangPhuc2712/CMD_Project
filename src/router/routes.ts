import { authRoutes } from '@/modules/web/auth/auth.routes'
import MainLayout from '@/layouts/MainLayout.vue'
import { dashboardRoutes } from '@/modules/web/dashboard/dashboard.routes'
import { usersRoutes } from '@/modules/web/users/users.routes'
import { areasRoutes } from '@/modules/web/areas/areas.routes'
import { reportsRoutes } from '@/modules/web/reports/reports.routes'
import { rolesRoutes } from '@/modules/web/roles/roles.routes'
import { routesRoutes } from '@/modules/web/routes/routes.routes'

export const routes = [
  ...authRoutes,
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      ...dashboardRoutes,
      ...usersRoutes,
      ...rolesRoutes,
      ...areasRoutes,
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
