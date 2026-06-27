import type { CmdReportRow } from '@/mocks/cmdData'

export async function exportPatrolReportXlsx(payload: { rows: CmdReportRow[]; fileName: string }) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Reports')

  sheet.columns = [
    { header: 'Route Name', key: 'routeName', width: 24 },
    { header: 'Checkpoint', key: 'checkpointName', width: 24 },
    { header: 'Inspection Result', key: 'inspectionResult', width: 18 },
    { header: 'Note', key: 'note', width: 28 },
    { header: 'Report Date', key: 'reportAt', width: 22 },
    { header: 'Processing Status', key: 'processingStatus', width: 22 },
    { header: 'Report By', key: 'reportBy', width: 22 },
  ]

  sheet.addRows(payload.rows)
  sheet.getRow(1).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBuffer(buffer, payload.fileName)
}

function downloadBuffer(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
