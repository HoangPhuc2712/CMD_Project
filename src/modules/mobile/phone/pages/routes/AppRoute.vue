<template>
  <section class="min-h-screen bg-sky-50 px-4 py-4">
    <div class="mx-auto flex min-h-[calc(100vh-2rem)] flex-col gap-4">
      <PageTopbar title="Routes" />

      <div class="flex flex-col gap-1">
        <p class="m-0 text-[22px] font-bold text-slate-900">{{ routeInfo.name }}</p>
        <p class="m-0 text-sm font-medium text-slate-500">
          Shift: {{ routeInfo.shiftDate }}, {{ routeInfo.startTime }} - {{ routeInfo.finishTime }}
        </p>
      </div>

      <div
        class="flex flex-1 flex-col rounded-[20px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      >
        <div class="grid grid-cols-4 gap-x-5 gap-y-5">
          <div
            v-for="(checkpoint, index) in checkpoints"
            :key="checkpoint.id"
            class="flex min-w-0 flex-col items-center"
          >
            <div class="relative mx-auto w-[58px]">
              <div
                class="flex aspect-square items-center justify-center rounded-[18px] border-2 border-dashed border-slate-300 bg-slate-50 text-center"
              >
                <i class="pi pi-map !text-[24px] text-slate-400" />
              </div>
              <div
                class="absolute bottom-[-0.375rem] right-[-0.25rem] flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-1 text-[10px] font-semibold text-slate-400"
              >
                {{ checkpoint.order }}
              </div>
              <span
                v-if="showConnector(index)"
                class="absolute left-full top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-300"
              />
            </div>

            <p
              class="m-0 mt-3 w-full break-words text-center text-xs font-semibold leading-4 text-slate-500"
            >
              {{ checkpoint.code }}
            </p>
          </div>
        </div>
      </div>

      <div class="pb-2">
        <p v-if="scanMessage" class="mb-3 text-center text-[13px] font-semibold text-slate-500">
          {{ scanMessage }}
        </p>
        <p v-if="errorMessage" class="mb-3 text-center text-[13px] font-semibold text-red-600">
          {{ errorMessage }}
        </p>

        <BaseIconButton
          icon="pi pi-camera !text-[18px]"
          label="Scan Checkpoint"
          size="large"
          class="h-[56px] w-full !text-[18px] !rounded-[18px]"
          :loading="scanning"
          @click="onScanCheckpoint"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import PageTopbar from '@/modules/mobile/shared/PageTopbar.vue'

type CheckpointCard = {
  id: string
  order: string
  code: string
}

const routeInfo = {
  name: 'Route A Patrol',
  shiftDate: '02 Jul 2026',
  startTime: '08:00',
  finishTime: '17:00',
}

const checkpoints: CheckpointCard[] = [
  { id: 'cp-01', order: '1', code: 'VP-01' },
  { id: 'cp-02', order: '2', code: 'Phòng bảo vệ' },
  { id: 'cp-03', order: '3', code: 'Cửa số 4 xưởng A' },
  { id: 'cp-04', order: '4', code: 'Trạm điện sau xưởng B' },
  { id: 'cp-05', order: '5', code: 'CP-05' },
  { id: 'cp-06', order: '6', code: 'CP-06' },
  { id: 'cp-07', order: '7', code: 'CP-07' },
  { id: 'cp-08', order: '8', code: 'CP-08' },
]

const scanning = ref(false)
const scanMessage = ref('')
const errorMessage = ref('')

function showConnector(index: number) {
  const isLastItem = index === checkpoints.length - 1
  const isEndOfRow = (index + 1) % 4 === 0

  return !isLastItem && !isEndOfRow
}

async function scanCheckpointBarcode() {
  if (!Capacitor.isNativePlatform()) {
    return 'CP-01'
  }

  const { supported } = await BarcodeScanner.isSupported()
  if (!supported) {
    throw new Error('SCANNER_NOT_SUPPORTED')
  }

  if (Capacitor.getPlatform() === 'android') {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule()
      throw new Error('SCANNER_MODULE_INSTALLING')
    }
  }

  const result = await BarcodeScanner.scan({
    formats: [
      BarcodeFormat.Code128,
      BarcodeFormat.Code39,
      BarcodeFormat.Code93,
      BarcodeFormat.Ean13,
      BarcodeFormat.Ean8,
      BarcodeFormat.QrCode,
    ],
    autoZoom: true,
  })

  const rawValue = result.barcodes[0]?.rawValue || result.barcodes[0]?.displayValue || ''
  if (!rawValue.trim()) throw new Error('CHECKPOINT_BARCODE_INVALID')

  return rawValue.trim()
}

async function onScanCheckpoint() {
  errorMessage.value = ''
  scanMessage.value = ''
  scanning.value = true

  try {
    const scannedCode = await scanCheckpointBarcode()
    scanMessage.value = `Scanned checkpoint: ${scannedCode}`
  } catch (error: any) {
    errorMessage.value =
      error?.message === 'CAMERA_PERMISSION_DENIED'
        ? 'Camera permission is required to scan checkpoints'
        : error?.message === 'SCANNER_MODULE_INSTALLING'
          ? 'Google barcode scanner module is installing. Please tap scan again in a moment.'
          : error?.message === 'SCANNER_NOT_SUPPORTED'
            ? 'This device does not support barcode scanning'
            : 'Checkpoint barcode is invalid or scanner is unavailable'
  } finally {
    scanning.value = false
  }
}
</script>
