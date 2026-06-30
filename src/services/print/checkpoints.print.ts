import type { CheckpointPrintItem, CheckpointQrLayout, PrintCheckpointQrSheetsOptions } from './checkpointsPrint.types'

function warnPrintUnavailable() {
  console.warn('[CMD] QR PDF print is not implemented in the CMD template yet.')
}

export async function printSingleCheckpointQr(_item: CheckpointPrintItem, _fileName?: string) {
  warnPrintUnavailable()
}

export async function printCheckpointQrSheets(
  _items: CheckpointPrintItem[],
  _fileName?: string,
  _layout?: CheckpointQrLayout,
  _options?: PrintCheckpointQrSheetsOptions,
) {
  warnPrintUnavailable()
}
