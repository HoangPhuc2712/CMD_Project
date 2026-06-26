<script setup lang="ts">
import Tag from 'primevue/tag'
import BaseDataTable from '@/components/base/table/BaseDataTable.vue'
import type { BaseTableColumn } from '@/types/table'
import { dashboardStats, recentActivities } from '@/mocks/dashboard'

interface ActivityRow extends Record<string, unknown> {
  id: number
  title: string
  user: string
  time: string
  status: string
}

const activityColumns: BaseTableColumn<ActivityRow>[] = [
  { field: 'title', header: 'Activity', minWidth: '16rem' },
  { field: 'user', header: 'User', minWidth: '8rem' },
  { field: 'time', header: 'Time', minWidth: '7rem' },
  { field: 'status', header: 'Status', minWidth: '9rem' },
]

function statusSeverity(status: string) {
  if (status === 'Completed') return 'success'
  if (status === 'Pending') return 'warn'
  return 'info'
}
</script>

<template>
  <section class="cmd-page">
    <div class="cmd-page-header">
      <div>
        <h1 class="cmd-page-title">Dashboard</h1>
        <p class="cmd-page-description">
          Overview cards and recent activity for the CMD report template.
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="stat in dashboardStats" :key="stat.label" class="cmd-dashboard-card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="m-0 text-sm font-semibold text-slate-500">{{ stat.label }}</p>
            <p class="m-0 mt-2 text-3xl font-extrabold text-slate-950">{{ stat.value }}</p>
          </div>
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <i :class="stat.icon" />
          </div>
        </div>
        <p class="m-0 mt-4 text-sm text-slate-500">{{ stat.caption }}</p>
      </article>
    </div>
  </section>
</template>
