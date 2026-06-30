import { Capacitor } from '@capacitor/core'

export type AppRuntimePlatform = 'web' | 'mobile'
export type NativeDeviceType = 'phone' | 'tablet' | null
export type AppDisplayTarget = 'web' | 'phone' | 'tablet'

export interface PlatformInfo {
  runtime: AppRuntimePlatform
  isNative: boolean
  nativeDeviceType: NativeDeviceType
  displayTarget: AppDisplayTarget
}

const TABLET_MIN_SCREEN_WIDTH = 768

function detectNativeDeviceType(): NativeDeviceType {
  if (typeof window === 'undefined') return null

  const shortestSide = Math.min(window.screen.width, window.screen.height)
  return shortestSide >= TABLET_MIN_SCREEN_WIDTH ? 'tablet' : 'phone'
}

export function detectPlatform(): PlatformInfo {
  const isNative = Capacitor.isNativePlatform()
  const nativeDeviceType = isNative ? detectNativeDeviceType() : null

  return {
    runtime: isNative ? 'mobile' : 'web',
    isNative,
    nativeDeviceType,
    displayTarget: nativeDeviceType ?? 'web',
  }
}

export function isMobilePlatform() {
  return detectPlatform().runtime === 'mobile'
}

export function isWebPlatform() {
  return detectPlatform().runtime === 'web'
}

export function getDefaultPlatformRoute() {
  const platform = detectPlatform()

  switch (platform.displayTarget) {
    case 'phone':
      return '/mobile/phone'
    case 'tablet':
      // Tablet UI is not implemented yet, so native devices fall back to phone for now.
      return '/mobile/phone'
    case 'web':
    default:
      return '/dashboard'
  }
}
