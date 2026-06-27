export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    getList: '/cmd/users',
  },
  roles: {
    getList: '/cmd/roles',
  },
  areas: {
    getList: '/cmd/areas',
  },
  routes: {
    getList: '/cmd/routes',
  },
  reports: {
    getList: '/cmd/reports',
    getDetailList: '/cmd/reports/detail',
  },
} as const
