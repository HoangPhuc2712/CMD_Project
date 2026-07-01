import type { CapacitorConfig } from '@capacitor/cli'

const liveReloadUrl = process.env.CAP_SERVER_URL?.trim()
const isLiveReloadCommand =
  process.env.CAP_LIVE_RELOAD === 'true' ||
  process.argv.includes('--live-reload') ||
  process.argv.includes('-l')

const config: CapacitorConfig = {
  appId: 'cmd.jiahsin.com.vn',
  appName: 'CMD Application',
  webDir: 'dist',
  ...(liveReloadUrl || isLiveReloadCommand
    ? {
        server: {
          ...(liveReloadUrl ? { url: liveReloadUrl } : {}),
          cleartext: true,
        },
      }
    : {}),
}

export default config
