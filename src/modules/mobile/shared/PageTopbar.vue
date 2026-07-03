<template>
  <header class="flex items-center justify-between gap-3 py-3 text-slate-700">
    <div class="flex min-w-0 items-center gap-2">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition hover:bg-white/10"
        aria-label="Go back"
        title="Go back"
        @click="goBack"
      >
        <i class="pi pi-angle-left !text-2xl" />
      </button>

      <div class="min-w-0">
        <p class="m-0 truncate text-2xl font-bold leading-none">
          {{ title }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <AppLanguageSwitcher />

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        :aria-label="online ? 'Online' : 'Offline'"
        :title="online ? 'Online' : 'Offline'"
      >
        <BxWifi :class="online ? 'text-green-500' : 'text-red-500'" class="h-6 w-6" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLanguageSwitcher from '@/components/app/AppLanguageSwitcher.vue'
import { BxWifi } from '@/utils/mobileIcons'

withDefaults(
  defineProps<{
    title: string
  }>(),
  {
    title: '',
  },
)

const router = useRouter()
const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

function syncOnlineState() {
  online.value = typeof navigator !== 'undefined' ? navigator.onLine : true
}

function goBack() {
  router.back()
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
