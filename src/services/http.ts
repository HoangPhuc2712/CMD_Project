import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  const mockToken = localStorage.getItem('cmd_mock_token')
  if (mockToken) {
    config.headers.Authorization = `Bearer ${mockToken}`
  }
  return config
})
