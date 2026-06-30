import { defineStore } from 'pinia'

export type MobileMockUser = {
  userCode: string
  password: string
  username: string
  userRole: string
}

const MOBILE_AUTH_STORAGE_KEY = 'cmd_mobile_mock_auth_session'

const mockUsers: MobileMockUser[] = [
  {
    userCode: 'P23591',
    password: '123456',
    username: 'Hoang Phuc',
    userRole: 'Patrol Leader',
  },
  {
    userCode: 'CMD001',
    password: 'CMD001',
    username: 'Nguyen Van A',
    userRole: 'Patrol Staff',
  },
]

function normalizeValue(value: string) {
  return value.trim().toUpperCase()
}

export const useMobileAuthStore = defineStore('mobile-auth', {
  state: () => ({
    user: null as Omit<MobileMockUser, 'password'> | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },
  actions: {
    persistSession() {
      if (!this.user) return
      localStorage.setItem(MOBILE_AUTH_STORAGE_KEY, JSON.stringify(this.user))
    },

    restoreSession() {
      const raw = localStorage.getItem(MOBILE_AUTH_STORAGE_KEY)
      if (!raw) return

      try {
        this.user = JSON.parse(raw) as Omit<MobileMockUser, 'password'>
      } catch {
        this.clearSession()
      }
    },

    clearSession() {
      this.user = null
      localStorage.removeItem(MOBILE_AUTH_STORAGE_KEY)
    },

    async login(userCode: string, password: string) {
      this.loading = true

      try {
        const normalizedUserCode = normalizeValue(userCode)
        const normalizedPassword = password.trim()

        const matchedUser = mockUsers.find(
          (user) =>
            normalizeValue(user.userCode) === normalizedUserCode &&
            user.password === normalizedPassword,
        )

        if (!matchedUser) {
          throw new Error('INVALID_CREDENTIALS')
        }

        this.user = {
          userCode: matchedUser.userCode,
          username: matchedUser.username,
          userRole: matchedUser.userRole,
        }
        this.persistSession()

        return this.user
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.clearSession()
    },
  },
})
