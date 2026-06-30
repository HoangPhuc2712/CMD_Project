<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import { createAreaMock, updateAreaMock } from '@/modules/web/areas/areas.api'

export type AreaFormMode = 'new' | 'view' | 'edit'

export type AreaFormModel = {
  area_id?: number
  area_code: string
  area_name: string
}

export type AreaFormSubmitPayload = {
  submit: (actor_id: string) => Promise<void>
}

const props = defineProps<{
  visible: boolean
  mode: AreaFormMode
  model: AreaFormModel | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: AreaFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() =>
  props.mode === 'new' ? 'Create Area' : props.mode === 'edit' ? 'Edit Area' : 'Area Detail',
)

const form = reactive({ area_id: undefined as number | undefined, area_code: '', area_name: '' })

const areaCodeError = computed(() => submitted.value && !form.area_code.trim())
const areaNameError = computed(() => submitted.value && !form.area_name.trim())

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.area_id = model?.area_id
    form.area_code = model?.area_code ?? ''
    form.area_name = model?.area_name ?? ''
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
  const code = form.area_code.trim()
  const name = form.area_name.trim()
  if (!code || !name) return

  emit('submit', {
    submit: async (actor_id: string) => {
      if (props.mode === 'new') {
        await createAreaMock({ area_code: code, area_name: name, actor_id })
        return
      }
      if (!form.area_id) throw new Error('AREA_NOT_FOUND')
      await updateAreaMock({ area_id: form.area_id, area_code: code, area_name: name, actor_id })
    },
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :style="{ width: '720px', maxWidth: '95vw' }"
    :closable="!isSubmitting"
    :closeOnEscape="!isSubmitting"
    @update:visible="emit('update:visible', $event)"
    @hide="close"
  >
    <div v-if="!model" class="text-slate-500">No area data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Draft UI only. Field names and validation will be adjusted after CMD API is confirmed.
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-slate-600">Area Code</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.area_code }}</div>
          <BaseInput
            v-else
            v-model="form.area_code"
            label=""
            size="small"
            placeholder="Enter area code"
            :hasError="areaCodeError"
            message="Area code is required."
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Area Name</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.area_name }}</div>
          <BaseInput
            v-else
            v-model="form.area_name"
            label=""
            size="small"
            placeholder="Enter area name"
            :hasError="areaNameError"
            message="Area name is required."
          />
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
