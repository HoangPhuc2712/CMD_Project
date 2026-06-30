<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type BreadcrumbItem = {
  label: string
  to?: { name: string; query?: Record<string, any> }
  clickableWhenLast?: boolean
}

const route = useRoute()
const router = useRouter()

const routeName = computed(() => String(route.name ?? ''))

const items = computed<BreadcrumbItem[]>(() => {
  const root: BreadcrumbItem = { label: 'CMD Web Report', to: { name: 'dashboard' } }

  switch (routeName.value) {
    case 'dashboard':
      return [root, { label: 'Dashboard', to: { name: 'dashboard' }, clickableWhenLast: true }]
    case 'users':
      return [root, { label: 'Users' }]
    case 'roles':
      return [root, { label: 'Roles' }]
    case 'areas':
      return [root, { label: 'Areas' }]
    case 'checkpoints':
      return [root, { label: 'Areas', to: { name: 'areas' } }, { label: 'Checkpoints' }]
    case 'routes':
      return [root, { label: 'Routes' }]
    case 'reports':
      return [root, { label: 'Reports', to: { name: 'reports' } }, { label: 'Report List' }]
    case 'patrol-detail-reports':
      return [root, { label: 'Reports', to: { name: 'reports' } }, { label: 'Patrol Detail Report' }]
    case 'user-info':
      return [root, { label: 'User Info' }]
    default:
      return [root]
  }
})

function onNavigate(item: BreadcrumbItem) {
  if (!item.to) return
  router.push(item.to)
}
</script>

<template>
  <nav aria-label="Breadcrumb" class="min-w-0">
    <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
      <li v-for="(item, index) in items" :key="`${item.label}-${index}`" class="flex items-center gap-1.5 min-w-0">
        <button
          v-if="item.to && (index < items.length - 1 || item.clickableWhenLast)"
          type="button"
          class="truncate rounded text-left transition hover:text-slate-900 hover:cursor-pointer"
          :class="index === items.length - 1 ? 'text-slate-800 font-medium' : ''"
          @click="onNavigate(item)"
        >
          {{ item.label }}
        </button>
        <span v-else class="truncate" :class="index === items.length - 1 ? 'text-slate-800 font-medium' : ''">
          {{ item.label }}
        </span>
        <span v-if="index < items.length - 1" class="text-slate-400">/</span>
      </li>
    </ol>
  </nav>
</template>
