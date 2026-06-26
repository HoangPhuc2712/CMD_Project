<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import type { BaseTableColumn } from '@/types/table'

const props = withDefaults(
  defineProps<{
    value?: T[]
    columns: BaseTableColumn<T>[]
    dataKey?: string
    gridLines?: boolean
    size?: 'small' | 'large'
    stripedRows?: boolean
    skeleton?: boolean
    loading?: boolean
    pagination?: boolean
    rows?: number
    totalRecords?: number
    lazy?: boolean
    first?: number
    toolbar?: boolean
    filterDisplay?: 'menu' | 'row'
    checkbox?: boolean
    selection?: T[]
    minHeight?: string
    maxHeight?: string
    scrollable?: boolean
    emptyMessage?: string
  }>(),
  {
    value: () => [],
    dataKey: 'id',
    rows: 10,
    first: 0,
    filterDisplay: 'menu',
    emptyMessage: 'No data found.',
  },
)

const emit = defineEmits<{
  page: [event: DataTablePageEvent]
  'update:first': [value: number]
  'update:selection': [value: T[]]
}>()

const tableStyle = computed(() => ({
  minHeight: props.minHeight,
  maxHeight: props.maxHeight,
}))

const skeletonRows = computed(() => Array.from({ length: props.rows || 6 }, (_, index) => index))
const displayRows = computed(() => (props.skeleton && props.loading ? [] : props.value))

function handlePage(event: DataTablePageEvent) {
  emit('update:first', event.first)
  emit('page', event)
}
</script>

<template>
  <div class="cmd-table-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div
      v-if="toolbar || $slots.toolbarStart || $slots.toolbarEnd || $slots.toolbar"
      class="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
    >
      <slot name="toolbar">
        <div class="flex flex-wrap items-center gap-2">
          <slot name="toolbarStart" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <slot name="toolbarEnd" />
        </div>
      </slot>
    </div>

    <DataTable
      :value="displayRows"
      :data-key="dataKey"
      :show-gridlines="gridLines"
      :size="size"
      :striped-rows="stripedRows"
      :loading="loading && !skeleton"
      :paginator="pagination"
      :rows="rows"
      :total-records="totalRecords"
      :lazy="lazy"
      :first="first"
      :filter-display="filterDisplay"
      :selection="selection"
      :scrollable="scrollable || Boolean(maxHeight)"
      :scroll-height="maxHeight"
      :style="tableStyle"
      responsive-layout="scroll"
      @page="handlePage"
      @update:selection="emit('update:selection', $event as T[])"
    >
      <template #empty>
        <div class="py-8 text-center text-sm text-slate-500">{{ emptyMessage }}</div>
      </template>

      <Column
        v-if="checkbox"
        selection-mode="multiple"
        header-style="width: 3rem"
        body-style="width: 3rem"
      />

      <Column
        v-for="column in columns"
        :key="String(column.field)"
        :field="String(column.field)"
        :header="column.header"
        :sortable="column.sortable"
        :frozen="column.frozen"
        :header-class="column.headerClass"
        :body-class="column.bodyClass"
        :style="{ minWidth: column.minWidth, width: column.width, textAlign: column.align }"
      >
        <template #body="slotProps">
          <Skeleton v-if="skeleton && loading" height="1.5rem" />
          <slot
            v-else
            :name="`body-${String(column.field)}`"
            :data="slotProps.data"
            :value="slotProps.data?.[column.field as keyof T]"
            :column="column"
          >
            {{ slotProps.data?.[column.field as keyof T] }}
          </slot>
        </template>
      </Column>
    </DataTable>

    <div v-if="skeleton && loading" class="hidden">
      <span v-for="row in skeletonRows" :key="row" />
    </div>
  </div>
</template>
