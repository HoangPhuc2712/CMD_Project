<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import { useLayoutStore } from '@/stores/layout.store'

const layout = useLayoutStore()
</script>

<template>
  <div class="cmd-layout" :class="{ 'cmd-layout--sidebar-open': layout.sidebarOpen }">
    <button class="cmd-sidebar-backdrop" aria-label="Close menu" @click="layout.closeSidebar" />
    <AppSidebar />

    <main class="cmd-layout__main">
      <AppTopbar />
      <div class="cmd-layout__content">
        <RouterView />
      </div>
    </main>
  </div>
</template>
