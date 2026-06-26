<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Button from 'primevue/button'
import type { PrimeSeverity, PrimeSize } from '@/types/common'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label?: string
    severity?: PrimeSeverity
    size?: PrimeSize
    outline?: boolean
    outlined?: boolean
    raised?: boolean
    rounded?: boolean
    loading?: boolean
    disabled?: boolean
    icon?: string
    iconEnd?: string
    iconPos?: 'start' | 'end'
    class?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    severity: 'primary',
    type: 'button',
    iconPos: 'start',
  },
)

const attrs = useAttrs()

const buttonIcon = computed(() => props.iconEnd || props.icon)
const primeIconPos = computed(() => (props.iconEnd || props.iconPos === 'end' ? 'right' : 'left'))
const isOutlined = computed(() => props.outlined || props.outline)
const buttonClass = computed(() => [props.class, attrs.class])
</script>

<template>
  <Button
    :type="type"
    :label="label"
    :severity="severity"
    :size="size"
    :outlined="isOutlined"
    :raised="raised"
    :rounded="rounded"
    :loading="loading"
    :disabled="disabled"
    :icon="buttonIcon"
    :icon-pos="primeIconPos"
    :class="buttonClass"
    v-bind="{ ...attrs, class: undefined }"
  >
    <slot />
  </Button>
</template>
