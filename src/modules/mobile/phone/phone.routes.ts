import { useAuthStore } from '@/stores/auth.store'

export const phoneRoutes = [
  {
    path: '/mobile/phone',
    name: 'mobile-phone-login',
    component: () => import('./pages/PhoneLogin.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/mobile/phone/home',
    name: 'mobile-phone-home',
    component: () => import('./pages/PhoneHome.vue'),
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
