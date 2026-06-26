<script setup lang="ts">
import Message from 'primevue/message'
import type { InlineMessageSeverity, InlineMessageVariant, PrimeSize } from '@/types/common'

withDefaults(
  defineProps<{
    icon?: string
    severity?: InlineMessageSeverity
    variant?: InlineMessageVariant
    size?: PrimeSize | 'small'
  }>(),
  {
    severity: 'info',
    variant: 'outlined',
  },
)
</script>

<template>
  <Message :severity="severity" :variant="variant" :size="size">
    <template v-if="icon" #icon>
      <i :class="icon" />
    </template>
    <slot />
  </Message>
</template>
