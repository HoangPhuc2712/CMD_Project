export interface MockReportRow extends Record<string, unknown> {
  id: number
  reportNo: string
  reportDate: string
  reporter: string
  area: string
  route: string
  issueCount: number
  status: string
}

export const mockReports: MockReportRow[] = [
  {
    id: 1,
    reportNo: 'CMD-RPT-2026-001',
    reportDate: '2026-06-22',
    reporter: 'CMD001',
    area: 'Factory A',
    route: 'Factory A - Week 1',
    issueCount: 1,
    status: 'Completed',
  },
  {
    id: 2,
    reportNo: 'CMD-RPT-2026-002',
    reportDate: '2026-06-23',
    reporter: 'CMD002',
    area: 'Factory B',
    route: 'Factory B - Week 1',
    issueCount: 0,
    status: 'Completed',
  },
  {
    id: 3,
    reportNo: 'CMD-RPT-2026-003',
    reportDate: '2026-06-24',
    reporter: 'CMD004',
    area: 'Warehouse',
    route: 'Warehouse - Morning',
    issueCount: 3,
    status: 'Pending',
  },
]
