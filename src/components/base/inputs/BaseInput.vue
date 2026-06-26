<script setup lang="ts">
import { computed, useId } from 'vue'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import type { PrimeSeverity, PrimeSize } from '@/types/common'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    icon?: string
    label?: string
    severity?: PrimeSeverity
    placeholder?: string
    size?: PrimeSize
    disabled?: boolean
    invalid?: boolean
    errorMessage?: string
    class?: string
    inputClass?: string
  }>(),
  {
    modelValue: '',
    severity: 'primary',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fallbackId = useId()
const inputId = computed(() => `base-input-${fallbackId}`)
const hasError = computed(() => props.invalid || Boolean(props.errorMessage))
</script>

<template>
  <div :class="['flex flex-col gap-2', props.class]">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700">
      {{ label }}
    </label>
    <InputText
      :id="inputId"
      :icon="icon"
      :label="label"
      :model-value="modelValue || ''"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :invalid="hasError"
      :class="inputClass"
      v-bind="$attrs"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
    <Message v-if="errorMessage" severity="error" size="small" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>
</template>
