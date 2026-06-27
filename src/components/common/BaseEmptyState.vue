<template>
  <div class="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
    <div class="max-w-md">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <i class="pi pi-lock text-2xl"></i>
      </div>
      <h2 class="text-xl font-semibold text-slate-800">{{ title || t('common.accessDenied') }}</h2>
      <p class="mt-2 text-sm text-slate-500">{{ message || t('common.accessDeniedDetail') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ title?: string; message?: string }>()
const { t } = useI18n()
</script>
