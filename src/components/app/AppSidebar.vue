<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink } from 'vue-router'

const props = withDefaults(
  defineProps<{
    mobileOpen?: boolean
    desktopOpen?: boolean
  }>(),
  {
    mobileOpen: false,
    desktopOpen: true,
  },
)

const emit = defineEmits<{
  (e: 'update:mobileOpen', v: boolean): void
}>()

const route = useRoute()
const attrs = useAttrs()
const { t } = useI18n()

type NavItem = {
  key: string
  label: string
  to: string
  icon: string
  prefix: string
}

const navItems = computed<NavItem[]>(() => [
  { key: 'DASHBOARD', label: t('dashboard.title'), to: '/dashboard', icon: 'pi pi-home', prefix: '/dashboard' },
  { key: 'USERS', label: t('breadcrumb.users'), to: '/users', icon: 'pi pi-users', prefix: '/users' },
  { key: 'ROLES', label: t('breadcrumb.roles'), to: '/roles', icon: 'pi pi-key', prefix: '/roles' },
  { key: 'AREAS', label: t('breadcrumb.areas'), to: '/areas', icon: 'pi pi-map-marker', prefix: '/areas' },
  { key: 'ROUTES', label: t('breadcrumb.routes'), to: '/routes', icon: 'pi pi-map', prefix: '/routes' },
  { key: 'REPORTS', label: t('breadcrumb.reports'), to: '/reports', icon: 'pi pi-clipboard', prefix: '/reports' },
])

function closeMobile() {
  emit('update:mobileOpen', false)
}

function itemClass(active: boolean) {
  return [
    'w-full flex items-center justify-between gap-3 cursor-pointer',
    'px-3 py-2 rounded-lg transition',
    active ? 'bg-white/10' : 'hover:bg-white/5',
  ].join(' ')
}

function isActivePath(prefix: string) {
  if (prefix === '/reports') {
    return route.path === '/reports' || route.path.startsWith('/reports/') || route.path === '/patrol-detail-reports'
  }
  return route.path === prefix || route.path.startsWith(prefix + '/')
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="closeMobile" />

  <aside
    v-bind="attrs"
    class="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:sticky lg:top-0 lg:left-auto lg:inset-y-auto lg:self-start lg:h-screen lg:translate-x-0 lg:overflow-hidden lg:transition-[width]"
    :class="[
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      props.desktopOpen ? 'lg:w-72' : 'lg:w-0',
    ]"
  >
    <div class="h-screen w-72 flex flex-col bg-slate-900 text-slate-100">
      <header class="px-4 py-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">
            <img src="/src/styles/logo/JiaHsinLogo.png" alt="Jia Hsin" />
          </div>
          <div class="leading-tight">
            <div class="text-base font-semibold">JIAHSIN CO., LTD</div>
            <div class="text-xs text-slate-300">CMD Web Report</div>
          </div>
        </div>
      </header>

      <nav class="flex-1 overflow-y-auto px-2 py-3">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.key">
            <RouterLink :to="item.to" v-slot="{ isActive }">
              <a :class="itemClass(isActive || isActivePath(item.prefix))" @click="closeMobile">
                <span class="flex items-center gap-3">
                  <i :class="item.icon"></i>
                  <span>{{ item.label }}</span>
                </span>
              </a>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
