<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import BasePasswordInput from '@/components/common/inputs/BasePasswordInput.vue'
import { createUserMock, updateUserMock } from '@/modules/web/users/users.api'

export type UserFormMode = 'new' | 'view' | 'edit'

export type UserFormModel = {
  user_id?: string
  user_code: string
  user_name: string
  user_password?: string
  user_role_id: number | null
  user_area_id: number | null
  role_name?: string
  area_name?: string
}

export type UserFormSubmitPayload = {
  submit: (actor_id: string) => Promise<void>
}

const props = defineProps<{
  visible: boolean
  mode: UserFormMode
  model: UserFormModel | null
  roleOptions?: { label: string; value: number }[]
  areaOptions?: { label: string; value: number }[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: UserFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isNew = computed(() => props.mode === 'new')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() =>
  props.mode === 'new' ? 'Create User' : props.mode === 'edit' ? 'Edit User' : 'User Detail',
)

const form = reactive({
  user_id: '' as string | undefined,
  user_code: '',
  user_name: '',
  user_password: '',
  user_role_id: null as number | null,
  user_area_id: null as number | null,
})

const codeError = computed(() => submitted.value && !form.user_code.trim())
const nameError = computed(() => submitted.value && !form.user_name.trim())
const passwordError = computed(() => submitted.value && isNew.value && !form.user_password.trim())
const roleError = computed(() => submitted.value && form.user_role_id == null)
const areaError = computed(() => submitted.value && form.user_area_id == null)

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.user_id = model?.user_id
    form.user_code = model?.user_code ?? ''
    form.user_name = model?.user_name ?? ''
    form.user_password = model?.user_password ?? ''
    form.user_role_id = model?.user_role_id ?? null
    form.user_area_id = model?.user_area_id ?? null
  },
  { immediate: true },
)

function close() {
  if (isSubmitting.value) return
  submitted.value = false
  emit('update:visible', false)
  emit('close')
}

function submit() {
  submitted.value = true
  const code = form.user_code.trim()
  const name = form.user_name.trim()
  const password = form.user_password.trim()
  if (!code || !name || form.user_role_id == null || form.user_area_id == null) return
  if (isNew.value && !password) return

  emit('submit', {
    submit: async (actor_id: string) => {
      if (props.mode === 'new') {
        await createUserMock({
          user_code: code,
          user_name: name,
          user_password: password,
          user_role_id: form.user_role_id!,
          user_area_id: form.user_area_id!,
          actor_id,
        })
        return
      }
      if (!form.user_id) throw new Error('USER_NOT_FOUND')
      await updateUserMock({
        user_id: form.user_id,
        user_code: code,
        user_name: name,
        user_password: password || undefined,
        user_role_id: form.user_role_id!,
        user_area_id: form.user_area_id!,
        actor_id,
      })
    },
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :style="{ width: '820px', maxWidth: '95vw' }"
    :closable="!isSubmitting"
    :closeOnEscape="!isSubmitting"
    @update:visible="emit('update:visible', $event)"
    @hide="close"
  >
    <div v-if="!model" class="text-slate-500">No user data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Draft UI only. User fields will be finalized after CMD authentication/API is confirmed.
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-slate-600">User Code</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.user_code }}</div>
          <BaseInput
            v-else
            v-model="form.user_code"
            label=""
            size="small"
            placeholder="Enter user code"
            :hasError="codeError"
            message="User code is required."
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">User Name</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.user_name }}</div>
          <BaseInput
            v-else
            v-model="form.user_name"
            label=""
            size="small"
            placeholder="Enter user name"
            :hasError="nameError"
            message="User name is required."
          />
        </div>
        <div v-if="!isView" class="md:col-span-2">
          <label class="mb-1 block text-sm text-slate-600">{{
            isNew ? 'Password' : 'New Password (optional)'
          }}</label>
          <BasePasswordInput
            v-model="form.user_password"
            label=""
            size="small"
            placeholder="Enter password"
            :feedback="false"
            :hasError="passwordError"
            message="Password is required."
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Role</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ roleOptions?.find((x) => x.value === form.user_role_id)?.label || '-' }}
          </div>
          <Select
            v-else
            v-model="form.user_role_id"
            :options="roleOptions"
            optionLabel="label"
            size="small"
            placeholder="Select role"
            class="w-full"
            :invalid="roleError"
          />
          <small v-if="roleError" class="mt-1 block text-red-500">Role is required.</small>
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Area</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ areaOptions?.find((x) => x.value === form.user_area_id)?.label || '-' }}
          </div>
          <Select
            v-else
            v-model="form.user_area_id"
            :options="areaOptions"
            optionLabel="label"
            size="small"
            placeholder="Select area"
            class="w-full"
            :invalid="areaError"
          />
          <small v-if="areaError" class="mt-1 block text-red-500">Area is required.</small>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-200 pt-3">
        <BaseButton
          label="Cancel"
          size="small"
          severity="danger"
          outlined
          :disabled="isSubmitting"
          @click="close"
        />
        <BaseButton
          v-if="!isView"
          label="Submit"
          size="small"
          severity="success"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>
