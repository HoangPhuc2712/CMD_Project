<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import BaseButton from '@/components/common/buttons/BaseButton.vue'

export type ReportFormMode = 'view' | 'edit'

export type ReportFormModel = {
  id?: number | string
  routeName?: string
  checkpointName?: string
  inspectionResult?: string
  note?: string
  reportAt?: string
  processingStatus?: string
  reportBy?: string
}

const props = defineProps<{
  visible: boolean
  mode?: ReportFormMode
  model: ReportFormModel | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'close'): void
}>()

const title = computed(() => (props.mode === 'edit' ? 'Edit Report' : 'Report Detail'))
const resultSeverity = computed(() => (props.model?.inspectionResult === 'OK' ? 'success' : 'danger'))

function close() {
  if (props.loading) return
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <Dialog :visible="visible" modal :header="title" :style="{ width: '760px', maxWidth: '95vw' }" :closable="!loading" :closeOnEscape="!loading" @update:visible="emit('update:visible', $event)" @hide="close">
    <div v-if="!model" class="text-slate-500">No report data.</div>
    <div v-else class="space-y-4">
      <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Draft UI only. Report detail fields will be replaced after CMD report API is confirmed.</div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div class="text-sm text-slate-500">Route</div>
          <div class="font-semibold text-slate-800">{{ model.routeName || '-' }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Checkpoint</div>
          <div class="font-semibold text-slate-800">{{ model.checkpointName || '-' }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Result</div>
          <Tag :value="model.inspectionResult || '-'" :severity="resultSeverity" />
        </div>
        <div>
          <div class="text-sm text-slate-500">Status</div>
          <div class="font-semibold text-slate-800">{{ model.processingStatus || '-' }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Report Date</div>
          <div class="font-semibold text-slate-800">{{ model.reportAt || '-' }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Report By</div>
          <div class="font-semibold text-slate-800">{{ model.reportBy || '-' }}</div>
        </div>
        <div class="md:col-span-2">
          <div class="text-sm text-slate-500">Note</div>
          <div class="whitespace-pre-line text-slate-800">{{ model.note || '-' }}</div>
        </div>
      </div>
      <div class="flex justify-end border-t border-slate-200 pt-3">
        <BaseButton label="Close" size="small" severity="secondary" outlined @click="close" />
      </div>
    </div>
  </Dialog>
</template>
