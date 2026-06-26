<script setup lang="ts">
import { computed, useId } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import type { PrimeSeverity, PrimeSize } from '@/types/common'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: number | null
    label?: string
    severity?: PrimeSeverity
    placeholder?: string
    size?: PrimeSize
    disabled?: boolean
    invalid?: boolean
    errorMessage?: string
    prefix?: string
    suffix?: string
    showButtons?: boolean
    class?: string
    inputClass?: string
  }>(),
  {
    severity: 'primary',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const fallbackId = useId()
const inputId = computed(() => `base-input-number-${fallbackId}`)
const hasError = computed(() => props.invalid || Boolean(props.errorMessage))
</script>

<template>
  <div :class="['flex flex-col gap-2', props.class]">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700">
      {{ label }}
    </label>
    <InputNumber
      :input-id="inputId"
      :model-value="modelValue"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :invalid="hasError"
      :prefix="prefix"
      :suffix="suffix"
      :show-buttons="showButtons"
      :input-class="inputClass"
      class="w-full"
      v-bind="$attrs"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <Message v-if="errorMessage" severity="error" size="small" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>
</template>
