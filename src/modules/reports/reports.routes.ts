export const reportsRoutes = [
  {
    path: 'reports',
    name: 'reports',
    component: () => import('@/modules/reports/pages/ReportList.vue'),
  },
  {
    path: 'patrol-detail-reports',
    name: 'patrol-detail-reports',
    component: () => import('@/modules/reports/pages/PatrolDetailReportList.vue'),
  },
]
