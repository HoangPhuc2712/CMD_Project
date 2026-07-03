<template>
  <header class="flex items-center justify-between gap-3 px-4 py-3 text-slate-700">
    <div class="min-w-0">
      <p class="m-0 text-2xl font-bold leading-none">CMD Patrol</p>
    </div>

    <div class="flex items-center gap-2">
      <AppLanguageSwitcher />

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        :aria-label="online ? 'Online' : 'Offline'"
        :title="online ? 'Online' : 'Offline'"
      >
        <BxWifi :class="online ? 'text-green-500' : 'text-red-300'" class="h-6 w-6" />
      </button>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-slate-800 transition hover:bg-white/25"
        aria-label="Logout"
        title="Logout"
        @click="onLogout"
      >
        <HuLogout class="h-8 w-8" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLanguageSwitcher from '@/components/app/AppLanguageSwitcher.vue'
import { BxWifi, HuLogout } from '@/utils/mobileIcons'
import { useAuthStore } from '@/stores/auth.store'
import { logoutUser } from '@/services/auth.service'

const router = useRouter()
const auth = useAuthStore()
const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

function syncOnlineState() {
  online.value = typeof navigator !== 'undefined' ? navigator.onLine : true
}

async function onLogout() {
  await logoutUser()
  await auth.logout()
  await router.replace({ name: 'mobile-phone-login' })
}

onMounted(() => {
  syncOnlineState()
  window.addEventListener('online', syncOnlineState)
  window.addEventListener('offline', syncOnlineState)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', syncOnlineState)
  window.removeEventListener('offline', syncOnlineState)
})
</script>
