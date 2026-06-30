<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import { createRole, updateRole } from '@/modules/web/roles/roles.api'

export type RoleFormMode = 'new' | 'view' | 'edit'

export type RoleFormModel = {
  role_id?: number
  role_code?: string
  role_name: string
  role_is_admin: boolean
  role_hour_report: boolean
  menu_ids: number[]
  menu_names?: string[]
}

export type RoleFormSubmitPayload = { submit: (actor_id: string) => Promise<void> }

const props = defineProps<{
  visible: boolean
  mode: RoleFormMode
  model: RoleFormModel | null
  menuOptions?: { label: string; value: number }[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: RoleFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() =>
  props.mode === 'new' ? 'Create Role' : props.mode === 'edit' ? 'Edit Role' : 'Role Detail',
)

const form = reactive({
  role_id: undefined as number | undefined,
  role_code: '',
  role_name: '',
  role_is_admin: false,
  role_hour_report: false,
  menu_ids: [] as number[],
})
const nameError = computed(() => submitted.value && !form.role_name.trim())
const menuError = computed(() => submitted.value && !form.menu_ids.length)

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.role_id = model?.role_id
    form.role_code = model?.role_code ?? ''
    form.role_name = model?.role_name ?? ''
    form.role_is_admin = Boolean(model?.role_is_admin)
    form.role_hour_report = Boolean(model?.role_hour_report)
    form.menu_ids = Array.isArray(model?.menu_ids) ? [...model!.menu_ids] : []
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
  const name = form.role_name.trim()
  if (!name || !form.menu_ids.length) return
  emit('submit', {
    submit: async (actor_id: string) => {
      const payload = {
        role_code: form.role_code,
        role_name: name,
        role_is_admin: form.role_is_admin,
        role_hour_report: form.role_hour_report,
        menu_ids: form.menu_ids,
        actor_id,
      }
      if (props.mode === 'new') {
        await createRole(payload)
        return
      }
      if (!form.role_id) throw new Error('ROLE_NOT_FOUND')
      await updateRole({ ...payload, role_id: form.role_id })
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
    <div v-if="!model" class="text-slate-500">No role data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Draft UI only. Permission rules will be adjusted after CMD authorization is confirmed.
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-slate-600">Role Name</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.role_name }}</div>
          <BaseInput
            v-else
            v-model="form.role_name"
            label=""
            size="small"
            placeholder="Enter role name"
            :hasError="nameError"
            message="Role name is required."
          />
        </div>
        <div class="flex items-end gap-2 mb-2">
          <Checkbox
            v-model="form.role_is_admin"
            inputId="role_is_admin"
            binary
            :disabled="isView"
          />
          <label for="role_is_admin" class="text-sm text-slate-700"
            >Administrator Permissions</label
          >
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm text-slate-600">Access Menu</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ model.menu_names?.join(', ') || '-' }}
          </div>
          <MultiSelect
            v-else
            v-model="form.menu_ids"
            :options="menuOptions"
            optionLabel="label"
            optionValue="value"
            size="small"
            display="chip"
            placeholder="Select menus"
            class="w-full"
            :invalid="menuError"
          />
          <small v-if="menuError" class="mt-1 block text-red-500"
            >At least one menu is required.</small
          >
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
