export type ReportRow = {
  id: number
  routeName: string
  checkpointName: string
  inspectionResult: 'OK' | 'NG'
  note: string
  reportAt: string
  processingStatus: 'No Action Needed' | 'Pending' | 'In Progress' | 'Completed'
  reportBy: string
}

export type PatrolDetailRow = {
  id: number
  shiftKey: string
  shiftName: string
  routeName: string
  checkpointName: string
  patrolTime: string
  reportBy: string
  result: 'OK' | 'NG'
  note: string
  shiftColor: string
}
