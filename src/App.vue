<script setup lang="ts">
import BaseToast from '@/components/base/notifications/BaseToast.vue'
</script>

<template>
  <RouterView />
  <BaseToast position="top-right" />
</template>
