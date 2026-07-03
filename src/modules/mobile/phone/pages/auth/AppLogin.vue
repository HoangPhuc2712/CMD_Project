<template>
  <section
    class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 bg-sky-50"
  >
    <div class="absolute w-full top-6 flex flex-row items-center justify-around gap-10">
      <div class="flex flex-row gap-3">
        <img
          src="/src/styles/logo/JiaHsinLogo.png"
          alt="Jia Hsin"
          class="h-10 w-10 object-contain"
        />
        <div class="min-w-0 leading-tight">
          <p class="truncate text-sm font-bold text-[#0b5ca8]">佳新責任有限公司</p>
          <p class="truncate text-xs font-bold uppercase text-[#0b5ca8]">CÔNG TY TNHH JIA HSIN</p>
        </div>
      </div>
      <AppLanguageSwitcher class="shrink-0" />
    </div>
    <div class="w-full flex flex-col gap-10">
      <div class="flex flex-col items-center justify-center">
        <p class="m-0 text-3xl font-bold text-slate-700">CMD Application</p>
      </div>
      <div
        class="relative z-10 w-full flex flex-col overflow-hidden rounded-[20px] bg-slate-50 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
      >
        <div class="flex mt-6 items-center justify-center">
          <p class="m-0 text-2xl text-slate-700 font-semibold">Login</p>
        </div>
        <div class="px-5 py-5 flex flex-col items-center justify-center gap-2">
          <div
            class="w-full h-[200px] border-1 rounded-[20px] border-dashed border-slate-500 flex flex-col items-center justify-center gap-5"
          >
            <div
              class="flex items-center justify-center bg-slate-200 rounded-full w-[80px] h-[80px]"
            >
              <i class="pi pi-camera !text-[40px] text-slate-400"></i>
            </div>
            <p class="text-md text-slate-500 text-center">
              Use your Employee's Barcode and scan to Login
            </p>
          </div>
        </div>
        <div class="grid gap-4 px-5 py-5">
          <p v-if="errorMessage" class="mt-[-4px] text-[13px] font-semibold text-red-600">
            {{ errorMessage }}
          </p>
          <BaseIconButton
            icon="pi pi-camera !text-[20px]"
            label="Scan to Login"
            size="large"
            class="h-[60px] w-full !text-[20px] !rounded-[18px]"
            :loading="auth.loading || scanning"
            @click="onScanLogin"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import AppLanguageSwitcher from '@/components/app/AppLanguageSwitcher.vue'

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
