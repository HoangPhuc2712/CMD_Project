<script setup lang="ts">
import { computed, useId } from 'vue'
import Password from 'primevue/password'
import Message from 'primevue/message'
import type { PrimeSeverity, PrimeSize } from '@/types/common'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    severity?: PrimeSeverity
    placeholder?: string
    size?: PrimeSize
    disabled?: boolean
    invalid?: boolean
    errorMessage?: string
    toggleMask?: boolean
    feedback?: boolean
    class?: string
    inputClass?: string
  }>(),
  {
    modelValue: '',
    severity: 'primary',
    toggleMask: true,
    feedback: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fallbackId = useId()
const inputId = computed(() => `base-password-${fallbackId}`)
const hasError = computed(() => props.invalid || Boolean(props.errorMessage))
const passwordInputClass = computed(() => ['w-full', props.inputClass])
</script>

<template>
  <div :class="['flex flex-col gap-2', props.class]">
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700">
      {{ label }}
    </label>
    <Password
      :input-id="inputId"
      :model-value="modelValue || ''"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :invalid="hasError"
      :toggle-mask="toggleMask"
      :feedback="feedback"
      :input-class="passwordInputClass"
      class="w-full"
      v-bind="$attrs"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
    <Message v-if="errorMessage" severity="error" size="small" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>
</template>
