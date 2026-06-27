<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h1 class="text-xl font-semibold text-slate-900">{{ t('breadcrumb.userInfo') }}</h1>
    <div class="mt-4 grid gap-5 text-sm text-slate-600 sm:grid-cols-2">
      <div>
        <div class="text-md font-semibold uppercase text-slate-400">
          {{ t('users.columns.code') }}
        </div>
        <div class="text-xl font-medium text-slate-800">{{ auth.user?.user_code || '—' }}</div>
      </div>
      <div>
        <div class="text-md font-semibold uppercase text-slate-400">
          {{ t('users.columns.name') }}
        </div>
        <div class="text-xl font-medium text-slate-800">{{ auth.user?.user_name || '—' }}</div>
      </div>
      <div>
        <div class="text-md font-semibold uppercase text-slate-400">
          {{ t('users.columns.role') }}
        </div>
        <div class="text-xl font-medium text-slate-800">
          {{ auth.user?.role?.role_name || '—' }}
        </div>
      </div>
    </div>
  </div>
</template>
