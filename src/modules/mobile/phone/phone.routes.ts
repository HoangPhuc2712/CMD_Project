import { useAuthStore } from '@/stores/auth.store'

export const phoneRoutes = [
  {
    path: '/mobile/phone',
    name: 'mobile-phone-login',
    component: () => import('./pages/auth/AppLogin.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/mobile/phone/home',
    name: 'mobile-phone-home',
    component: () => import('./pages/home/AppHome.vue'),
    meta: { requiresAuth: true },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.token) auth.restoreSession()

      if (!auth.isAuthenticated) {
        return { name: 'mobile-phone-login' }
      }

      return true
    },
  },
  {
    path: '/mobile/phone/routes',
    name: 'mobile-phone-routes',
    component: () => import('./pages/routes/AppRoute.vue'),
    meta: { requiresAuth: true },
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.token) auth.restoreSession()

      if (!auth.isAuthenticated) {
        return { name: 'mobile-phone-login' }
      }

      return true
    },
  },
]
