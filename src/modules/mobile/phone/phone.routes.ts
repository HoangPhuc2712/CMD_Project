import { useMobileAuthStore } from '@/modules/mobile/shared/stores/mobileAuth.store'

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
    meta: { requiresAuth: false },
    beforeEnter: () => {
      const mobileAuth = useMobileAuthStore()
      mobileAuth.restoreSession()

      if (!mobileAuth.isAuthenticated) {
        return { name: 'mobile-phone-login' }
      }

      return true
    },
  },
]
