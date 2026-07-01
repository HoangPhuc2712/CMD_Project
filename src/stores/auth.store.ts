import { defineStore } from 'pinia'
import type { PersistedAuthSession } from '@/types/auth'
import type { PermissionKey } from '@/utils/permission'

export type AuthUser = {
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
type MobileLoginCache = {
  lastEmployeeCode: string
  savedAt: string
}

export const AUTH_SESSION_STORAGE_KEY = 'cmd_auth_session'
const MOBILE_LOGIN_CACHE_STORAGE_KEY = 'cmd_mobile_auth_cache'
const ACCESS_TOKEN_LIFETIME_MS = 4 * 24 * 60 * 60 * 1000
const SESSION_EXPIRED_MESSAGE = 'Phien dang nhap da het han, vui long dang nhap lai'

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

function normalizeUserCode(value: string) {
  return value.trim().toUpperCase()
}

function createMockUser(userCode: string): AuthUser {
  const normalizedCode = normalizeUserCode(userCode)
  const isAdmin = normalizedCode === 'P23591'
  const userNameMap: Record<string, string> = {
    P23591: 'Administrator',
    CMD001: 'Nguyen Van A',
  }

  return {
    user_id: isAdmin ? 'CMD-ADMIN-001' : `CMD-USER-${normalizedCode}`,
    user_code: normalizedCode,
    user_name: userNameMap[normalizedCode] || 'CMD User',
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

function createMockToken(user: AuthUser) {
  return `cmd-mock-token-${user.user_id}`
}

function extractEmployeeCodeFromBarcode(barcodeRaw: string) {
  const normalizedBarcode = barcodeRaw.trim().toUpperCase()
  if (!normalizedBarcode) return ''

  const matchedCode = normalizedBarcode.match(/[A-Z]\d{4,}/)?.[0]
  if (matchedCode) return matchedCode

  const tokens = normalizedBarcode.split(/[^A-Z0-9]+/).filter(Boolean)
  return tokens.at(-1) ?? normalizedBarcode
}

function getDefaultTokenExpiry() {
  return new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS).toISOString()
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
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isAdminUser: (state) => Boolean(state.user?.user_role_is_admin),
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

      const session: PersistedAuthSession<AuthUser> = {
        savedAt: new Date().toISOString(),
        tokens: {
          accessToken: this.token,
          refreshToken: this.refreshToken || undefined,
          tokenType: this.tokenType,
          expiresAt: this.tokenExpiresAt,
        },
        user: this.user,
      }

      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
    },

    setSession(payload: {
      user: AuthUser
      token: string
      expiresAt: string
      refreshToken?: string
      tokenType?: string
    }) {
      this.token = payload.token
      this.refreshToken = payload.refreshToken || ''
      this.tokenType = payload.tokenType || 'Bearer'
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

    saveMobileLoginCache(userCode: string) {
      const cache: MobileLoginCache = {
        lastEmployeeCode: normalizeUserCode(userCode),
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem(MOBILE_LOGIN_CACHE_STORAGE_KEY, JSON.stringify(cache))
    },

    readMobileLoginCache() {
      const raw = localStorage.getItem(MOBILE_LOGIN_CACHE_STORAGE_KEY)
      if (!raw) return null

      try {
        return JSON.parse(raw) as MobileLoginCache
      } catch {
        localStorage.removeItem(MOBILE_LOGIN_CACHE_STORAGE_KEY)
        return null
      }
    },

    restoreSession() {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
      if (!raw) return

      try {
        const parsed = JSON.parse(raw) as
          | PersistedAuthSession<AuthUser>
          | {
              token?: string
              refreshToken?: string
              tokenType?: string
              expiresAt?: string
              user?: AuthUser
            }

        const session =
          'tokens' in parsed
            ? {
                token: parsed.tokens?.accessToken,
                refreshToken: parsed.tokens?.refreshToken,
                tokenType: parsed.tokens?.tokenType,
                expiresAt: parsed.tokens?.expiresAt,
                user: parsed.user,
              }
            : parsed

        if (!session.token || !session.user) return
        if (isExpired(session.expiresAt)) {
          this.clearSession()
          void sessionExpiredHandler?.(SESSION_EXPIRED_MESSAGE)
          return
        }

        this.token = session.token
        this.refreshToken = session.refreshToken || ''
        this.tokenType = session.tokenType || 'Bearer'
        this.tokenExpiresAt = session.expiresAt || getDefaultTokenExpiry()
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
        const normalizedCode = normalizeUserCode(userCode)
        if (!normalizedCode) throw new Error('USER_NOT_FOUND')
        if (!password.trim()) throw new Error('INVALID_PASSWORD')

        const allowedPasswords = new Set(['P23591', '123456', normalizedCode])
        if (!allowedPasswords.has(password.trim())) {
          throw new Error('INVALID_PASSWORD')
        }

        const user = createMockUser(normalizedCode)
        this.setSession({
          user,
          token: createMockToken(user),
          expiresAt: getDefaultTokenExpiry(),
        })

        return { user }
      } finally {
        this.loading = false
      }
    },

    async loginWithEmployeeBarcode(barcodeRaw: string) {
      this.loading = true

      try {
        const employeeCode = extractEmployeeCodeFromBarcode(barcodeRaw)
        if (!employeeCode) throw new Error('EMPLOYEE_BARCODE_INVALID')

        const user = createMockUser(employeeCode)
        this.setSession({
          user,
          token: createMockToken(user),
          expiresAt: getDefaultTokenExpiry(),
        })
        this.saveMobileLoginCache(user.user_code)

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
