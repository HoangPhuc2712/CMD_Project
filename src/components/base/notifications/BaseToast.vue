<script setup lang="ts">
import Toast from 'primevue/toast'

withDefaults(
  defineProps<{
    severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'
  }>(),
  {
    severity: 'info',
    position: 'top-right',
  },
)
</script>

<template>
  <Toast :position="position" />
</template>
