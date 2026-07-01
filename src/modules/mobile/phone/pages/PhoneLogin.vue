<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#e0f2fe_46%,#f8fafc_100%)] px-4 py-6">
    <div class="pointer-events-none absolute -left-14 top-[-72px] h-[220px] w-[220px] rounded-full bg-sky-600/20 blur-[28px]"></div>
    <div class="pointer-events-none absolute -bottom-20 right-[-72px] h-[220px] w-[220px] rounded-full bg-cyan-400/20 blur-[28px]"></div>

    <div class="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
      <div class="bg-[linear-gradient(135deg,#0369a1_0%,#0ea5e9_100%)] px-5 py-[22px] text-white">
        <p class="m-0 text-xs font-bold uppercase tracking-[0.18em]">CMD Patrol</p>
        <h1 class="mb-[6px] mt-[10px] text-[28px] font-bold">Mobile Login</h1>
        <p class="m-0 text-sm leading-6 text-white/90">Scan employee barcode to sign in on mobile</p>
      </div>

      <div class="grid gap-4 px-5 py-5">
        <div class="rounded-[20px] border border-sky-100 bg-[linear-gradient(180deg,#f0f9ff_0%,#eff6ff_100%)] px-4 py-[14px]">
          <p class="mb-[6px] text-xs font-bold uppercase tracking-[0.08em] text-sky-700">Employee scan</p>
          <p class="m-0 text-base font-bold text-slate-900">Mock barcode: EMP:P23591</p>
        </div>

        <div v-if="scannedCode" class="rounded-[20px] border border-cyan-100 bg-white px-4 py-4 shadow-sm">
          <p class="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-cyan-700">Scanned code</p>
          <p class="m-0 break-all text-sm font-semibold text-slate-700">{{ scannedCode }}</p>
        </div>

        <p v-if="errorMessage" class="mt-[-4px] text-[13px] font-semibold text-red-600">{{ errorMessage }}</p>

        <BaseButton
          class="w-full"
          label="Scan Employee Barcode"
          :loading="auth.loading || scanning"
          @click="onScanLogin"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

const scannedCode = ref('')
const scanning = ref(false)
const errorMessage = ref('')

if (!auth.token) auth.restoreSession()

if (auth.isAuthenticated) {
  void router.replace({ name: 'mobile-phone-home' })
}

async function scanEmployeeBarcode() {
  if (!Capacitor.isNativePlatform()) {
    return 'EMP:P23591'
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
  if (!rawValue.trim()) throw new Error('EMPLOYEE_BARCODE_INVALID')

  return rawValue.trim()
}

async function onScanLogin() {
  errorMessage.value = ''
  scanning.value = true

  try {
    scannedCode.value = await scanEmployeeBarcode()
    await auth.loginWithEmployeeBarcode(scannedCode.value)
    await router.replace({ name: 'mobile-phone-home' })
  } catch (error: any) {
    auth.clearSession()
    errorMessage.value =
      error?.message === 'CAMERA_PERMISSION_DENIED'
        ? 'Camera permission is required to scan employee barcode'
        : error?.message === 'SCANNER_MODULE_INSTALLING'
          ? 'Google barcode scanner module is installing. Please tap scan again in a moment.'
          : error?.message === 'SCANNER_NOT_SUPPORTED'
            ? 'This device does not support barcode scanning'
        : 'Employee barcode is invalid or scanner is unavailable'
  } finally {
    scanning.value = false
  }
}
</script>
