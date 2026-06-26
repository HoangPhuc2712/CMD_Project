<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menuGroups = [
  {
    label: 'Main',
    items: [{ label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', icon: 'pi pi-users', to: '/users' },
      { label: 'Roles', icon: 'pi pi-shield', to: '/roles' },
      { label: 'Areas', icon: 'pi pi-map-marker', to: '/areas' },
      { label: 'Routes', icon: 'pi pi-sitemap', to: '/routes' },
    ],
  },
  {
    label: 'Report',
    items: [{ label: 'Reports', icon: 'pi pi-chart-bar', to: '/reports' }],
  },
]
</script>

<template>
  <aside class="cmd-sidebar">
    <div class="cmd-sidebar__inner">
      <div class="cmd-sidebar__brand">
        <div class="cmd-sidebar__brand-mark">CMD</div>
        <div class="min-w-0">
          <p class="cmd-sidebar__brand-title">CMD Report</p>
          <p class="cmd-sidebar__brand-subtitle">Web Template</p>
        </div>
      </div>

      <nav class="cmd-sidebar__menu">
        <template v-for="group in menuGroups" :key="group.label">
          <p class="cmd-sidebar__menu-label">{{ group.label }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="cmd-sidebar__menu-link"
            :class="{
              'router-link-active': route.path.startsWith(item.to) && item.to !== '/dashboard',
            }"
          >
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </template>
      </nav>
    </div>
  </aside>
</template>
