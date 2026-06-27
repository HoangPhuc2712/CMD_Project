<template>
  <div class="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
    <div class="max-w-md">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <i class="pi pi-search text-2xl"></i>
      </div>
      <h2 class="text-xl font-semibold text-slate-800">{{ t('common.pageNotFound') }}</h2>
      <p class="mt-2 text-sm text-slate-500">{{ t('common.pageNotFoundDetail') }}</p>
      <RouterLink to="/dashboard" class="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
        {{ t('common.backToDashboard') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
