<template>
  <section class="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_100%)] px-4 py-6">
    <div class="mx-auto max-w-[420px]">
      <div class="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div
          class="bg-[linear-gradient(135deg,#0f766e_0%,#06b6d4_100%)] px-5 pb-14 pt-[22px] text-white"
        >
          <p class="mb-[10px] text-xs font-bold uppercase tracking-[0.18em]">CMD Patrol</p>
          <h1 class="m-0 text-[30px] font-bold leading-[1.2]">{{ authUser?.user_name }}</h1>
        </div>

        <div class="-mt-8 px-5 pb-5">
          <p class="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-teal-700">
            User Information
          </p>
          <div
            class="mb-[18px] rounded-[22px] border border-teal-100 bg-[linear-gradient(180deg,#f0fdfa_0%,#ecfeff_100%)] px-4 py-[18px] text-[18px] font-bold text-slate-900"
          >
            {{ authUser?.user_code }} - {{ authUser?.role?.role_name || 'CMD' }}
          </div>

          <BaseButton class="w-full" label="Logout" @click="onLogout" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

if (!auth.token) auth.restoreSession()

const authUser = computed(() => auth.user)

async function onLogout() {
  await auth.logout()
  await router.replace({ name: 'mobile-phone-login' })
}
</script>
