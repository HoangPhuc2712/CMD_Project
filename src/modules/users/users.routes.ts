export const usersRoutes = [
  {
    path: 'users',
    name: 'users',
    component: () => import('@/modules/users/pages/UserList.vue'),
  },
  {
    path: 'user-info',
    name: 'user-info',
    component: () => import('@/modules/users/pages/UserInfo.vue'),
  },
]
