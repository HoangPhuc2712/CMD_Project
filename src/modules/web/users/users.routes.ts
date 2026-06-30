export const usersRoutes = [
  {
    path: 'users',
    name: 'users',
    component: () => import('@/modules/web/users/pages/UserList.vue'),
  },
  {
    path: 'user-info',
    name: 'user-info',
    component: () => import('@/modules/web/users/pages/UserInfo.vue'),
  },
]
