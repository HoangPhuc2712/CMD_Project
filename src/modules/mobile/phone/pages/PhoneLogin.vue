<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#e0f2fe_46%,#f8fafc_100%)] px-4 py-6">
    <div class="pointer-events-none absolute -left-14 top-[-72px] h-[220px] w-[220px] rounded-full bg-sky-600/20 blur-[28px]"></div>
    <div class="pointer-events-none absolute -bottom-20 right-[-72px] h-[220px] w-[220px] rounded-full bg-cyan-400/20 blur-[28px]"></div>

    <div class="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
      <div class="bg-[linear-gradient(135deg,#0369a1_0%,#0ea5e9_100%)] px-5 py-[22px] text-white">
        <p class="m-0 text-xs font-bold uppercase tracking-[0.18em]">CMD Patrol</p>
        <h1 class="mb-[6px] mt-[10px] text-[28px] font-bold">Mobile Login</h1>
        <p class="m-0 text-sm leading-6 text-white/90">Dang nhap bang tai khoan mock de vao phone app</p>
      </div>

      <div class="grid gap-4 px-5 py-5">
        <div class="rounded-[20px] border border-sky-100 bg-[linear-gradient(180deg,#f0f9ff_0%,#eff6ff_100%)] px-4 py-[14px]">
          <p class="mb-[6px] text-xs font-bold uppercase tracking-[0.08em] text-sky-700">Mock account</p>
          <p class="m-0 text-base font-bold text-slate-900">P23591 / 123456</p>
        </div>

        <BaseInput
          v-model="userCode"
          class="w-full"
          label="User Code"
          :hasError="submitted && !userCode.trim()"
          message="Vui long nhap user code"
          size="large"
        />

        <BasePasswordInput
          v-model="password"
          class="w-full"
          label="Password"
          :hasError="submitted && !password.trim()"
          message="Vui long nhap password"
          size="large"
          :feedback="false"
          :toggleMask="true"
        />

        <p v-if="errorMessage" class="mt-[-4px] text-[13px] font-semibold text-red-600">{{ errorMessage }}</p>

        <BaseButton class="w-full" label="Login" :loading="mobileAuth.loading" @click="onLogin" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import { BaseInput, BasePasswordInput } from '@/components/common/inputs'
import { useMobileAuthStore } from '@/modules/mobile/shared/stores/mobileAuth.store'

const router = useRouter()
const mobileAuth = useMobileAuthStore()

const userCode = ref('P23591')
const password = ref('123456')
const submitted = ref(false)
const errorMessage = ref('')

mobileAuth.restoreSession()

if (mobileAuth.isAuthenticated) {
  void router.replace({ name: 'mobile-phone-home' })
}

async function onLogin() {
  submitted.value = true
  errorMessage.value = ''

  if (!userCode.value.trim() || !password.value.trim()) {
    return
  }

  try {
    await mobileAuth.login(userCode.value, password.value)
    await router.replace({ name: 'mobile-phone-home' })
  } catch {
    mobileAuth.clearSession()
    errorMessage.value = 'Sai tai khoan hoac mat khau mock'
  }
}
</script>
