<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import { createCheckpointMock, updateCheckpointMock } from '@/modules/web/checkpoints/checkpoints.api'

export type CheckpointFormMode = 'new' | 'view' | 'edit'

export type CheckpointFormModel = {
  cp_id?: number
  cp_code: string
  cp_name: string
  cp_qr?: string
  cp_description: string
  cp_priority: number
  area_id: number | null
  role_ids: number[]
  role_names?: string[]
}

export type CheckpointFormSubmitPayload = { submit: (actor_id: string) => Promise<void> }

const props = defineProps<{
  visible: boolean
  mode: CheckpointFormMode
  model: CheckpointFormModel | null
  areaOptions?: { label: string; value: number }[]
  roleOptions?: { label: string; value: number }[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: CheckpointFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() => props.mode === 'new' ? 'Create Checkpoint' : props.mode === 'edit' ? 'Edit Checkpoint' : 'Checkpoint Detail')

const form = reactive({
  cp_id: undefined as number | undefined,
  cp_code: '',
  cp_name: '',
  cp_description: '',
  cp_priority: 1,
  area_id: null as number | null,
  role_ids: [] as number[],
})

const nameError = computed(() => submitted.value && !form.cp_name.trim())
const areaError = computed(() => submitted.value && form.area_id == null)
const roleError = computed(() => submitted.value && !form.role_ids.length)
const priorityError = computed(() => submitted.value && Number(form.cp_priority) < 1)

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.cp_id = model?.cp_id
    form.cp_code = model?.cp_code ?? ''
    form.cp_name = model?.cp_name ?? ''
    form.cp_description = model?.cp_description ?? ''
    form.cp_priority = Number(model?.cp_priority ?? 1)
    form.area_id = model?.area_id ?? null
    form.role_ids = Array.isArray(model?.role_ids) ? [...model!.role_ids] : []
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
  const name = form.cp_name.trim()
  if (!name || form.area_id == null || !form.role_ids.length || Number(form.cp_priority) < 1) return
  emit('submit', {
    submit: async (actor_id: string) => {
      const payload = { cp_name: name, cp_description: form.cp_description.trim(), cp_priority: Number(form.cp_priority), area_id: form.area_id!, role_ids: form.role_ids, actor_id }
      if (props.mode === 'new') {
        await createCheckpointMock(payload)
        return
      }
      if (!form.cp_id) throw new Error('CHECKPOINT_NOT_FOUND')
      await updateCheckpointMock({ ...payload, cp_id: form.cp_id })
    },
  })
}
</script>

<template>
  <Dialog :visible="visible" modal :header="title" :style="{ width: '880px', maxWidth: '95vw' }" :closable="!isSubmitting" :closeOnEscape="!isSubmitting" @update:visible="emit('update:visible', $event)" @hide="close">
    <div v-if="!model" class="text-slate-500">No checkpoint data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Draft UI only. CMD checkpoint fields may change after backend/API is confirmed.</div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-slate-600">Checkpoint Code</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.cp_code || '-' }}</div>
          <BaseInput v-else v-model="form.cp_code" label="Checkpoint Code" size="small" placeholder="Auto / CP001" disabled />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Checkpoint Name</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.cp_name }}</div>
          <BaseInput v-else v-model="form.cp_name" label="Checkpoint Name" size="small" placeholder="PD-02" :hasError="nameError" message="Checkpoint name is required." />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Area</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ areaOptions?.find((x) => x.value === form.area_id)?.label || '-' }}</div>
          <Select v-else v-model="form.area_id" :options="areaOptions" optionLabel="label" optionValue="value" placeholder="Select area" class="w-full" :invalid="areaError" />
          <small v-if="areaError" class="mt-1 block text-red-500">Area is required.</small>
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Priority</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.cp_priority }}</div>
          <InputNumber v-else v-model="form.cp_priority" :min="1" showButtons class="w-full" inputClass="w-full" :invalid="priorityError" />
          <small v-if="priorityError" class="mt-1 block text-red-500">Priority must be 1 or greater.</small>
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm text-slate-600">Role</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ roleOptions?.filter((x) => form.role_ids.includes(x.value)).map((x) => x.label).join(', ') || '-' }}</div>
          <MultiSelect v-else v-model="form.role_ids" :options="roleOptions" optionLabel="label" optionValue="value" display="chip" placeholder="Select roles" class="w-full" :invalid="roleError" />
          <small v-if="roleError" class="mt-1 block text-red-500">At least one role is required.</small>
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm text-slate-600">Description</label>
          <div v-if="isView" class="whitespace-pre-line text-slate-800">{{ form.cp_description || '-' }}</div>
          <Textarea v-else v-model="form.cp_description" rows="4" class="w-full" placeholder="Enter checkpoint description" />
        </div>
      </div>
      <div class="flex justify-end gap-2 border-t border-slate-200 pt-3">
        <BaseButton label="Cancel" size="small" severity="danger" outlined :disabled="isSubmitting" @click="close" />
        <BaseButton v-if="!isView" label="Submit" size="small" severity="success" :loading="isSubmitting" :disabled="isSubmitting" @click="submit" />
      </div>
    </div>
  </Dialog>
</template>
