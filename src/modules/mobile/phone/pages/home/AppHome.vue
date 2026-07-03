<template>
  <section class="min-h-screen bg-sky-50 px-4 py-4">
    <div class="mx-auto flex max-w-[420px] flex-col gap-4">
      <HomeTopbar />

      <div
        class="rounded-[20px] bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] flex flex-col"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 items-center gap-4">
            <Avatar
              shape="circle"
              size="large"
              class="bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              aria-label="User avatar"
            >
              <BxSolidUser class="absolute h-6 w-6 text-slate-700" />
              <span
                class="h-3 w-3 rounded-full relative -bottom-6 -right-4 -translate-y-1/2 border-2 border-white"
                :class="online ? 'bg-green-500' : 'bg-red-500'"
              />
            </Avatar>

            <div class="min-w-0 flex flex-col gap-2">
              <div class="flex flex-row gap-2 items-center truncate">
                <p class="m-0 text-lg font-bold text-slate-800">CMD User</p>
              </div>
              <div class="flex flex-row items-center gap-1 m-0 truncate text-sm text-slate-700">
                <p class="m-0 truncate text-sm text-slate-500">R39558</p>
                -
                <Tag class="m-0 truncate !text-xs text-slate-500">CMD</Tag>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end gap-2 text-right">
            <div class="flex flex-col min-w-0 items-start gap-2 text-right">
              <i class="pi pi-map-marker mt-1 !text-[24px] text-orange-600" />
              <div class="min-w-0">
                <p class="m-0 truncate text-sm font-semibold text-slate-900">JHV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-[20px] px-5 py-5">
        <div class="mb-4">
          <p class="m-0 text-md font-bold uppercase text-slate-700">Category</p>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="item in menuItems"
            :key="item.key"
            type="button"
            class="flex flex-col items-center gap-2 px-2 py-4 text-center"
            @click="onMenuItemClick(item)"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl text-teal-700">
              <i :class="item.icon" class="!text-[32px]" />
            </div>
            <span class="text-md font-medium leading-4 text-slate-700">
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Avatar from 'primevue/avatar'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import HomeTopbar from '@/modules/mobile/shared/HomeTopbar.vue'
import Tag from 'primevue/tag'
import { BxSolidUser } from '@/utils/mobileIcons'

const auth = useAuthStore()

type MobileMenuItem = {
  key: string
  label: string
  icon: string
  route?: RouteLocationRaw
}

const router = useRouter()
const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

if (!auth.token) auth.restoreSession()

const menuItems: MobileMenuItem[] = [
  { key: 'routes', label: 'Routes', icon: 'pi pi-map', route: { name: 'mobile-phone-routes' } },
  { key: 'reports', label: 'Reports', icon: 'pi pi-file' },
]

async function onMenuItemClick(item: MobileMenuItem) {
  if (!item.route) return

  const resolved = router.resolve(item.route)
  if (!resolved.matched.length) return

  await router.push(item.route)
}

function syncOnlineState() {
  online.value = typeof navigator !== 'undefined' ? navigator.onLine : true
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
