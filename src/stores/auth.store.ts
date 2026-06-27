import { defineStore } from 'pinia'
import type { PermissionKey } from '@/utils/permission'

type AuthUser = {
  user_id: string
  user_code: string
  user_name: string
  user_role_id: number
  user_role_is_admin: boolean
  role?: {
    role_id: number
    role_code: string
    role_name: string
    role_is_admin?: boolean
  }
}

type SessionExpiredHandler = (message: string) => void | Promise<void>

const AUTH_SESSION_STORAGE_KEY = 'cmd_auth_session'
const ACCESS_TOKEN_LIFETIME_MS = 4 * 24 * 60 * 60 * 1000
const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'

let sessionExpiryTimer: ReturnType<typeof setTimeout> | null = null
let sessionExpiredHandler: SessionExpiredHandler | null = null

export function registerSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler
}

function clearSessionExpiryTimer() {
  if (sessionExpiryTimer) {
    clearTimeout(sessionExpiryTimer)
    sessionExpiryTimer = null
  }
}

function createMockUser(userCode: string): AuthUser {
  const isAdmin = userCode.trim().toUpperCase() === 'P23591'
  return {
    user_id: isAdmin ? 'CMD-ADMIN-001' : 'CMD-USER-001',
    user_code: userCode.trim(),
    user_name: isAdmin ? 'Administrator' : 'CMD User',
    user_role_id: isAdmin ? 1 : 2,
    user_role_is_admin: isAdmin,
    role: {
      role_id: isAdmin ? 1 : 2,
      role_code: isAdmin ? 'ADMIN' : 'CMD',
      role_name: isAdmin ? 'Administrator' : 'CMD',
      role_is_admin: isAdmin,
    },
  }
}

function getExpiryTime(expiresAt?: string | null) {
  const time = new Date(String(expiresAt ?? '')).getTime()
  return Number.isFinite(time) ? time : 0
}

function isExpired(expiresAt?: string | null) {
  const expiryTime = getExpiryTime(expiresAt)
  return expiryTime > 0 && expiryTime <= Date.now()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    refreshToken: '' as string,
    tokenType: 'Bearer' as string,
    tokenExpiresAt: '' as string,
    user: null as AuthUser | null,
    loading: false,
    sessionSyncedOnce: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    isAdminUser: (s) => Boolean(s.user?.user_role_is_admin),
  },
  actions: {
    canAccess(_required?: PermissionKey | PermissionKey[]) {
      return true
    },

    isTokenExpired() {
      return isExpired(this.tokenExpiresAt)
    },

    scheduleSessionExpiry() {
      clearSessionExpiryTimer()
      if (!this.token || !this.user) return

      const expiryTime = getExpiryTime(this.tokenExpiresAt)
      if (!expiryTime) return

      const delay = expiryTime - Date.now()
      if (delay <= 0) {
        void this.expireSession()
        return
      }

      sessionExpiryTimer = setTimeout(() => {
        void this.expireSession()
      }, delay)
    },

    persistSession() {
      if (!this.token || !this.user) return

      localStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          tokenType: this.tokenType,
          expiresAt: this.tokenExpiresAt,
          user: this.user,
        }),
      )
    },

    setSession(payload: { user: AuthUser; token: string; expiresAt: string }) {
      this.token = payload.token
      this.refreshToken = ''
      this.tokenType = 'Bearer'
      this.tokenExpiresAt = payload.expiresAt
      this.user = payload.user
      this.sessionSyncedOnce = true
      this.persistSession()
      this.scheduleSessionExpiry()
    },

    clearSession() {
      clearSessionExpiryTimer()
      this.token = ''
      this.refreshToken = ''
      this.tokenType = 'Bearer'
      this.tokenExpiresAt = ''
      this.user = null
      this.sessionSyncedOnce = false
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    },

    async expireSession() {
      if (!this.token && !this.user) return
      this.clearSession()
      await sessionExpiredHandler?.(SESSION_EXPIRED_MESSAGE)
    },

    async logout() {
      this.clearSession()
    },

    restoreSession() {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
      if (!raw) return

      try {
        const session = JSON.parse(raw) as {
          token?: string
          tokenType?: string
          expiresAt?: string
          user?: AuthUser
        }

        if (!session.token || !session.user) return
        if (isExpired(session.expiresAt)) {
          this.clearSession()
          void sessionExpiredHandler?.(SESSION_EXPIRED_MESSAGE)
          return
        }

        this.token = session.token
        this.tokenType = session.tokenType || 'Bearer'
        this.tokenExpiresAt = session.expiresAt || new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS).toISOString()
        this.user = session.user
        this.sessionSyncedOnce = true
        this.scheduleSessionExpiry()
      } catch {
        this.clearSession()
      }
    },

    async login(userCode: string, password: string) {
      this.loading = true
      try {
        const normalizedCode = userCode.trim()
        if (!normalizedCode) throw new Error('USER_NOT_FOUND')
        if (!password.trim()) throw new Error('INVALID_PASSWORD')

        const allowedPasswords = new Set(['P23591', '123456', normalizedCode])
        if (!allowedPasswords.has(password.trim())) {
          throw new Error('INVALID_PASSWORD')
        }

        const user = createMockUser(normalizedCode)
        this.setSession({
          user,
          token: `cmd-mock-token-${user.user_id}`,
          expiresAt: new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS).toISOString(),
        })

        return { user }
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.token) return
      if (this.isTokenExpired()) {
        await this.expireSession()
        return
      }
      this.sessionSyncedOnce = true
    },

    async syncSessionWithServer() {
      if (!this.token) return false
      if (this.isTokenExpired()) {
        await this.expireSession()
        return false
      }
      this.sessionSyncedOnce = true
      return true
    },
  },
})
