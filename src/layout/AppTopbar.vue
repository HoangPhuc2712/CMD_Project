<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import BaseButton from '@/components/base/button/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useLayoutStore } from '@/stores/layout.store'

const auth = useAuthStore()
const layout = useLayoutStore()
const router = useRouter()
const toast = useToast()

const userInitials = computed(() => {
  const name = auth.user?.name || 'CMD'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

async function logout() {
  auth.logout()
  toast.add({ severity: 'success', summary: 'Logged out', detail: 'You have logged out.', life: 2500 })
  await router.push('/login')
}
</script>

<template>
  <header class="cmd-topbar">
    <div class="cmd-topbar__left">
      <BaseButton
        icon="pi pi-bars"
        severity="secondary"
        outlined
        rounded
        class="lg:hidden"
        aria-label="Open menu"
        @click="layout.toggleSidebar"
      />
      <div>
        <p class="cmd-topbar__title">CMD Website Report</p>
        <p class="cmd-topbar__subtitle">Sakai-inspired dashboard template</p>
      </div>
    </div>

    <div class="cmd-topbar__right">
      <div class="cmd-user-chip">
        <div class="cmd-user-chip__avatar">{{ userInitials }}</div>
        <div class="cmd-user-chip__meta min-w-0">
          <div class="truncate text-sm font-bold text-slate-800">{{ auth.user?.name }}</div>
          <div class="truncate text-xs text-slate-500">{{ auth.user?.role }}</div>
        </div>
      </div>
      <BaseButton icon="pi pi-sign-out" severity="secondary" outlined rounded aria-label="Logout" @click="logout" />
    </div>
  </header>
</template>
