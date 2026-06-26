<script setup lang="ts">
import ButtonGroup from 'primevue/buttongroup'
import BaseButton from './BaseButton.vue'
import type { PrimeSeverity, PrimeSize } from '@/types/common'

export interface BaseGroupButtonItem {
  key: string | number
  label?: string
  icon?: string
  iconEnd?: string
  severity?: PrimeSeverity
  size?: PrimeSize
  outlined?: boolean
  raised?: boolean
  rounded?: boolean
  loading?: boolean
  disabled?: boolean
}

withDefaults(
  defineProps<{
    items?: BaseGroupButtonItem[]
    size?: PrimeSize
    severity?: PrimeSeverity
  }>(),
  {
    items: () => [],
    severity: 'primary',
  },
)

const emit = defineEmits<{
  click: [item: BaseGroupButtonItem]
}>()
</script>

<template>
  <ButtonGroup>
    <slot>
      <BaseButton
        v-for="item in items"
        :key="item.key"
        :label="item.label"
        :icon="item.icon"
        :icon-end="item.iconEnd"
        :severity="item.severity || severity"
        :size="item.size || size"
        :outlined="item.outlined"
        :raised="item.raised"
        :rounded="item.rounded"
        :loading="item.loading"
        :disabled="item.disabled"
        @click="emit('click', item)"
      />
    </slot>
  </ButtonGroup>
</template>
