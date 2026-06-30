<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import { createRouteMock, updateRouteMock } from '@/modules/web/routes/routes.api'
import type { RouteDetailModel, ScanPointOption } from '@/modules/web/routes/routes.types'

export type RouteFormMode = 'new' | 'view' | 'edit'

export type RouteFormModel = {
  route_id?: number
  route_code?: string
  route_name: string
  area_id: number | null
  role_id: number | null
  route_priority: number
  route_min_minute: number
  route_max_minute: number
  details: RouteDetailModel[]
}

export type RouteFormSubmitPayload = { submit: (actor_id: string) => Promise<void> }

const props = defineProps<{
  visible: boolean
  mode: RouteFormMode
  model: RouteFormModel | null
  areaOptions?: { label: string; value: number }[]
  roleOptions?: { label: string; value: number }[]
  scanPointOptions?: ScanPointOption[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: RouteFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() =>
  props.mode === 'new' ? 'Create Route' : props.mode === 'edit' ? 'Edit Route' : 'Route Detail',
)

const form = reactive({
  route_id: undefined as number | undefined,
  route_code: '',
  route_name: '',
  area_id: null as number | null,
  role_id: null as number | null,
  route_priority: 1,
  route_min_minute: 0,
  route_max_minute: 0,
  checkpoint_ids: [] as number[],
})

const nameError = computed(() => submitted.value && !form.route_name.trim())
const areaError = computed(() => submitted.value && form.area_id == null)
const roleError = computed(() => submitted.value && form.role_id == null)
const checkpointError = computed(() => submitted.value && !form.checkpoint_ids.length)

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.route_id = model?.route_id
    form.route_code = model?.route_code ?? ''
    form.route_name = model?.route_name ?? ''
    form.area_id = model?.area_id ?? null
    form.role_id = model?.role_id ?? null
    form.route_priority = Number(model?.route_priority ?? 1)
    form.route_min_minute = Number(model?.route_min_minute ?? 0)
    form.route_max_minute = Number(model?.route_max_minute ?? 0)
    form.checkpoint_ids = Array.isArray(model?.details)
      ? model!.details.map((detail) => Number(detail.cp_id))
      : []
  },
  { immediate: true },
)

const selectedDetails = computed<RouteDetailModel[]>(() => {
  return form.checkpoint_ids
    .map((id, index) => {
      const option = props.scanPointOptions?.find((item) => Number(item.value) === Number(id))
      if (!option) return null
      return {
        cp_id: option.value,
        cp_code: option.cpCode,
        cp_name: option.cpName,
        cp_qr: option.cpQr ?? '',
        cp_priority: option.cpPriority,
        rd_minute: 0,
        rd_priority: index + 1,
      }
    })
    .filter(Boolean) as RouteDetailModel[]
})

function close() {
  if (isSubmitting.value) return
  submitted.value = false
  emit('update:visible', false)
  emit('close')
}

function submit() {
  submitted.value = true
  const name = form.route_name.trim()
  if (!name || form.area_id == null || form.role_id == null || !form.checkpoint_ids.length) return
  emit('submit', {
    submit: async (actor_id: string) => {
      const payload = {
        route_name: name,
        area_id: form.area_id!,
        role_id: form.role_id!,
        route_priority: Number(form.route_priority ?? 1),
        route_min_minute: Number(form.route_min_minute ?? 0),
        route_max_minute: Number(form.route_max_minute ?? 0),
        details: selectedDetails.value,
        actor_id,
      }
      if (props.mode === 'new') {
        await createRouteMock(payload)
        return
      }
      if (!form.route_id) throw new Error('ROUTE_NOT_FOUND')
      await updateRouteMock({ ...payload, route_id: form.route_id })
    },
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :style="{ width: '920px', maxWidth: '95vw' }"
    :closable="!isSubmitting"
    :closeOnEscape="!isSubmitting"
    @update:visible="emit('update:visible', $event)"
    @hide="close"
  >
    <div v-if="!model" class="text-slate-500">No route data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Draft UI only. Route/checkpoint timing rules will be finalized after CMD flow is confirmed.
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-slate-600">Route Name</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.route_name }}</div>
          <BaseInput
            v-else
            v-model="form.route_name"
            label=""
            size="small"
            placeholder="Enter route name"
            :hasError="nameError"
            message="Route name is required."
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Area</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ areaOptions?.find((x) => x.value === form.area_id)?.label || '-' }}
          </div>
          <Select
            v-else
            v-model="form.area_id"
            :options="areaOptions"
            optionLabel="label"
            placeholder="Select area"
            size="small"
            class="w-full"
            :hasError="areaError"
            message="Area is required."
          />
          <small v-if="areaError" class="mt-1 block text-red-500">Area is required.</small>
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Role</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ roleOptions?.find((x) => x.value === form.role_id)?.label || '-' }}
          </div>
          <Select
            v-else
            v-model="form.role_id"
            :options="roleOptions"
            optionLabel="label"
            size="small"
            placeholder="Select role"
            class="w-full"
            :hasError="roleError"
            message="Role is required."
          />
          <small v-if="roleError" class="mt-1 block text-red-500">Role is required.</small>
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Priority</label>
          <div v-if="isView" class="font-semibold text-slate-800">{{ form.route_priority }}</div>
          <InputNumber
            v-else
            v-model="form.route_priority"
            :min="1"
            size="small"
            showButtons
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Min Minute</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ form.route_min_minute }}
          </div>
          <InputNumber
            v-else
            v-model="form.route_min_minute"
            :min="0"
            size="small"
            showButtons
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-slate-600">Max Minute</label>
          <div v-if="isView" class="font-semibold text-slate-800">
            {{ form.route_max_minute }}
          </div>
          <InputNumber
            v-else
            v-model="form.route_max_minute"
            :min="0"
            size="small"
            showButtons
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm text-slate-600">Checkpoints</label>
          <div v-if="isView" class="space-y-1 font-semibold text-slate-800">
            <div v-for="detail in selectedDetails" :key="detail.cp_id">
              {{ detail.rd_priority }}. {{ detail.cp_name }}
            </div>
            <span v-if="!selectedDetails.length">-</span>
          </div>
          <MultiSelect
            v-else
            v-model="form.checkpoint_ids"
            :options="scanPointOptions"
            optionLabel="label"
            optionValue="value"
            size="small"
            display="chip"
            placeholder="Select checkpoints"
            class="w-full"
            :invalid="checkpointError"
          />
          <small v-if="checkpointError" class="mt-1 block text-red-500"
            >At least one checkpoint is required.</small
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
