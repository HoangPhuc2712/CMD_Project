<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BasePasswordInput from '@/components/common/inputs/BasePasswordInput.vue'
import { changeCurrentUserPassword } from '@/modules/web/users/users.api'

const props = defineProps<{
  visible: boolean
  userId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'saved'): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const form = reactive({ current_password: '', new_password: '', confirm_password: '' })
const isSubmitting = computed(() => Boolean(props.loading))
const currentError = computed(() => submitted.value && !form.current_password.trim())
const newError = computed(() => submitted.value && !form.new_password.trim())
const confirmError = computed(() => submitted.value && form.confirm_password !== form.new_password)

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      submitted.value = false
      form.current_password = ''
      form.new_password = ''
      form.confirm_password = ''
    }
  },
)

function close() {
  if (isSubmitting.value) return
  emit('update:visible', false)
  emit('close')
}

async function submit() {
  submitted.value = true
  if (
    !props.userId ||
    !form.current_password.trim() ||
    !form.new_password.trim() ||
    form.confirm_password !== form.new_password
  )
    return
  await changeCurrentUserPassword({
    user_id: props.userId,
    current_password: form.current_password,
    new_password: form.new_password,
  })
  emit('saved')
  close()
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Change Password"
    :style="{ width: '520px', maxWidth: '95vw' }"
    :closable="!isSubmitting"
    :closeOnEscape="!isSubmitting"
    @update:visible="emit('update:visible', $event)"
    @hide="close"
  >
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
        <BasePasswordInput
          v-model="form.current_password"
          label=""
          placeholder="Enter current password"
          size="small"
          :hasError="currentError"
          message="Current password is required."
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">New Password</label>
        <BasePasswordInput
          v-model="form.new_password"
          label=""
          placeholder="Enter new password"
          size="small"
          :hasError="newError"
          message="New password is required."
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
        <BasePasswordInput
          v-model="form.confirm_password"
          label=""
          placeholder="Confirm new password"
          size="small"
          :hasError="confirmError"
          message="Password confirmation does not match."
        />
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
