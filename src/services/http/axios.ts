import Axios, { AxiosError } from 'axios'
import { appConfig } from '@/config/app'
import { AUTH_SESSION_STORAGE_KEY } from '@/stores/auth.store'

const baseURL = appConfig.apiBaseUrl || ''

type UnauthorizedHandler = (error: AxiosError) => void | Promise<void>

let unauthorizedHandler: UnauthorizedHandler | null = null

function getExpiryTime(expiresAt?: string | null) {
  const value = String(expiresAt ?? '').trim()
  if (!value) return 0

  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function isExpired(expiresAt?: string | null) {
  const expiryTime = getExpiryTime(expiresAt)
  return expiryTime > 0 && expiryTime <= Date.now()
}

function readPersistedAuthToken() {
  try {
    const authSessionRaw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (authSessionRaw) {
      const parsed = JSON.parse(authSessionRaw) as {
        token?: string
        tokenType?: string
        expiresAt?: string
        tokens?: {
          accessToken?: string
          tokenType?: string
          expiresAt?: string
        }
      }

      const accessToken = String(parsed?.tokens?.accessToken ?? parsed?.token ?? '').trim()
      const tokenType = String(parsed?.tokens?.tokenType ?? parsed?.tokenType ?? 'Bearer').trim() || 'Bearer'
      const expiresAt = String(parsed?.tokens?.expiresAt ?? parsed?.expiresAt ?? '').trim()
      if (accessToken) return { accessToken, tokenType, expiresAt }
    }
  } catch {
    // Ignore invalid cached auth session and fall back to legacy token storage.
  }

  const legacyToken = String(localStorage.getItem('token') ?? '').trim()
  if (!legacyToken) return null
  return { accessToken: legacyToken, tokenType: 'Bearer', expiresAt: '' }
}

function isAuthTokenEndpoint(url?: string) {
  const raw = String(url ?? '').toLowerCase()
  return raw.includes('/user/validate') || raw.includes('/user/logout')
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

export const http = Axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

http.interceptors.request.use(async (config) => {
  const authToken = readPersistedAuthToken()

  if (authToken?.accessToken && !isAuthTokenEndpoint(config.url)) {
    if (isExpired(authToken.expiresAt)) {
      const error = new AxiosError('AUTH_TOKEN_EXPIRED', 'AUTH_TOKEN_EXPIRED', config)
      if (unauthorizedHandler) await unauthorizedHandler(error)
      return Promise.reject(error)
    }

    config.headers = config.headers ?? {}
    if (!config.headers.Authorization && !(config.headers as any).authorization) {
      config.headers.Authorization = `${authToken.tokenType} ${authToken.accessToken}`
    }
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      await unauthorizedHandler(error)
    }

    return Promise.reject(error)
  },
)
