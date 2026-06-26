<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import BaseButton from '@/components/base/button/BaseButton.vue'
import BaseInput from '@/components/base/inputs/BaseInput.vue'
import BasePasswordInput from '@/components/base/inputs/BasePasswordInput.vue'
import BaseInlineMessage from '@/components/base/notifications/BaseInlineMessage.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const form = reactive({
  username: 'cmd',
  password: '123456',
})

async function submitLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    await auth.login(form)
    toast.add({
      severity: 'success',
      summary: 'Login successful',
      detail: 'Welcome to CMD Web Report.',
      life: 2500,
    })
    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to login.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-slate-950 p-4">
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        class="absolute bottom-[-12rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-cyan-500/20 blur-3xl"
      />
    </div>

    <section
      class="cmd-card relative z-10 w-full max-w-md overflow-hidden border-white/10 bg-white/95 shadow-2xl"
    >
      <div class="cmd-card-body">
        <div class="mb-8 flex items-center gap-3">
          <div
            class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-extrabold text-white shadow-lg shadow-blue-500/30"
          >
            CMD
          </div>
          <div>
            <h1 class="m-0 text-xl font-extrabold text-slate-950">CMD Web Report</h1>
            <p class="m-0 text-sm text-slate-500">Mock login template</p>
          </div>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="submitLogin">
          <BaseInput v-model="form.username" label="Username" placeholder="Enter username" />
          <BasePasswordInput
            v-model="form.password"
            label="Password"
            placeholder="Enter password"
            toggle-mask
          />

          <BaseInlineMessage
            v-if="errorMessage"
            severity="error"
            variant="simple"
            icon="pi pi-times-circle"
          >
            {{ errorMessage }}
          </BaseInlineMessage>

          <BaseButton
            type="submit"
            label="Login"
            icon-end="pi pi-arrow-right"
            :loading="loading"
            class="mt-2 w-full"
          />
        </form>
      </div>
    </section>
  </main>
</template>
