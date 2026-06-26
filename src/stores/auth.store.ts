import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { MockUser } from '@/types/auth'

const USER_KEY = 'cmd_mock_user'
const TOKEN_KEY = 'cmd_mock_token'

const defaultMockUser: MockUser = {
  id: 'mock-admin-001',
  code: 'CMD001',
  name: 'CMD Administrator',
  role: 'Admin',
  email: 'cmd.admin@jiahsin.com',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<MockUser | null>(loadUser())
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

  const isAuthenticated = computed(() => Boolean(user.value && token.value))

  async function login(payload: { username: string; password: string }) {
    if (!payload.username.trim() || !payload.password.trim()) {
      throw new Error('Please enter username and password.')
    }

    const mockUser: MockUser = {
      ...defaultMockUser,
      code: payload.username.trim().toUpperCase(),
      name: payload.username.trim() === 'cmd' ? 'CMD Administrator' : payload.username.trim(),
    }

    const mockToken = `mock-token-${Date.now()}`
    user.value = mockUser
    token.value = mockToken
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
    localStorage.setItem(TOKEN_KEY, mockToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }
})

function loadUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as MockUser) : null
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}
