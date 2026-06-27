<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cmdAreas, cmdReports, cmdRoles, cmdRoutes, cmdUsers } from '@/mocks/cmdData'

const { t } = useI18n()

const cards = computed(() => [
  {
    label: t('breadcrumb.users'),
    value: cmdUsers.length,
    icon: 'pi pi-users',
    color: 'bg-blue-500',
  },
  {
    label: t('breadcrumb.roles'),
    value: cmdRoles.length,
    icon: 'pi pi-key',
    color: 'bg-amber-500',
  },
  {
    label: t('breadcrumb.areas'),
    value: cmdAreas.length,
    icon: 'pi pi-map-marker',
    color: 'bg-emerald-500',
  },
  {
    label: t('breadcrumb.routes'),
    value: cmdRoutes.length,
    icon: 'pi pi-map',
    color: 'bg-purple-500',
  },
  {
    label: t('breadcrumb.reports'),
    value: cmdReports.length,
    icon: 'pi pi-clipboard',
    color: 'bg-sky-500',
  },
])
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('dashboard.title') }}</h1>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'flex h-11 w-11 items-center justify-center rounded-xl text-white',
              card.color,
            ]"
          >
            <i :class="card.icon" />
          </div>
          <div class="flex flex-col gap-2">
            <div class="text-md text-slate-500">{{ card.label }}</div>
            <div class="text-3xl font-bold text-slate-900">{{ card.value }}</div>
            <div class="text-sm text-slate-500">View details</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
