<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import BaseButton from '@/components/common/buttons/BaseButton.vue'
import BaseInput from '@/components/common/inputs/BaseInput.vue'
import { createRole, updateRole } from '@/modules/web/roles/roles.api'
import type {
  MenuCategoryOption,
  MenuPermissionAction,
  MenuPermissionMap,
} from '@/modules/web/roles/roles.types'

export type RoleFormMode = 'new' | 'view' | 'edit'

export type RoleFormModel = {
  role_id?: number
  role_code?: string
  role_name: string
  role_is_admin: boolean
  role_hour_report: boolean
  menu_ids: number[]
  menu_names?: string[]
  menu_permissions?: Record<number, MenuPermissionMap>
}

export type RoleFormSubmitPayload = { submit: (actor_id: string) => Promise<void> }

const props = defineProps<{
  visible: boolean
  mode: RoleFormMode
  model: RoleFormModel | null
  menuOptions?: MenuCategoryOption[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: RoleFormSubmitPayload): void
  (e: 'close'): void
}>()

const submitted = ref(false)
const isView = computed(() => props.mode === 'view')
const isSubmitting = computed(() => Boolean(props.loading))
const title = computed(() =>
  props.mode === 'new' ? 'Create Role' : props.mode === 'edit' ? 'Edit Role' : 'Role Detail',
)

const permissionActions: { key: MenuPermissionAction; label: string }[] = [
  { key: 'view', label: 'VIEW' },
  { key: 'create', label: 'CREATE' },
  { key: 'update', label: 'UPDATE' },
  { key: 'delete', label: 'DELETE' },
  { key: 'import', label: 'IMPORT' },
  { key: 'export', label: 'EXPORT' },
]

const form = reactive({
  role_id: undefined as number | undefined,
  role_code: '',
  role_name: '',
  role_is_admin: false,
  role_hour_report: false,
  menu_ids: [] as number[],
  menu_permissions: {} as Record<number, MenuPermissionMap>,
})

const nameError = computed(() => submitted.value && !form.role_name.trim())
const menuError = computed(() => submitted.value && !form.menu_ids.length)

function createEmptyPermissionMap(): MenuPermissionMap {
  return {
    view: false,
    create: false,
    update: false,
    delete: false,
    import: false,
    export: false,
  }
}

function normalizePermissionMap(value?: Partial<MenuPermissionMap>): MenuPermissionMap {
  return {
    ...createEmptyPermissionMap(),
    ...(value ?? {}),
  }
}

function syncSelectedMenuPermissions(menuIds: number[], source?: Record<number, MenuPermissionMap>) {
  const nextPermissions: Record<number, MenuPermissionMap> = {}
  for (const menuId of menuIds) {
    nextPermissions[menuId] = normalizePermissionMap(source?.[menuId] ?? { view: true })
  }
  form.menu_permissions = nextPermissions
}

function hasPermissionValue(menuId: number, key: MenuPermissionAction) {
  return Boolean(form.menu_permissions[menuId]?.[key])
}

function setPermissionValue(menuId: number, key: MenuPermissionAction, checked: boolean) {
  if (!form.menu_permissions[menuId]) {
    form.menu_permissions[menuId] = createEmptyPermissionMap()
  }
  form.menu_permissions[menuId][key] = checked
  if (key === 'view' && checked === false) {
    form.menu_permissions[menuId].create = false
    form.menu_permissions[menuId].update = false
    form.menu_permissions[menuId].delete = false
    form.menu_permissions[menuId].import = false
    form.menu_permissions[menuId].export = false
  }
}

watch(
  () => props.model,
  (model) => {
    submitted.value = false
    form.role_id = model?.role_id
    form.role_code = model?.role_code ?? ''
    form.role_name = model?.role_name ?? ''
    form.role_is_admin = Boolean(model?.role_is_admin)
    form.role_hour_report = Boolean(model?.role_hour_report)
    form.menu_ids = Array.isArray(model?.menu_ids) ? [...model!.menu_ids] : []
    syncSelectedMenuPermissions(form.menu_ids, model?.menu_permissions)
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
  const name = form.role_name.trim()
  if (!name || !form.menu_ids.length) return

  const menu_permissions = Object.fromEntries(
    form.menu_ids.map((menuId) => [menuId, normalizePermissionMap(form.menu_permissions[menuId])]),
  )

  emit('submit', {
    submit: async (actor_id: string) => {
      const payload = {
        role_code: form.role_code,
        role_name: name,
        role_is_admin: form.role_is_admin,
        role_hour_report: form.role_hour_report,
        menu_ids: form.menu_ids,
        menu_permissions,
        actor_id,
      }
      if (props.mode === 'new') {
        await createRole(payload)
        return
      }
      if (!form.role_id) throw new Error('ROLE_NOT_FOUND')
      await updateRole({ ...payload, role_id: form.role_id })
    },
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :style="{ width: '820px', maxWidth: '95vw' }"
    :closable="!isSubmitting"
    :closeOnEscape="!isSubmitting"
    @update:visible="emit('update:visible', $event)"
    @hide="close"
  >
    <div v-if="!model" class="text-slate-500">No role data.</div>
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">Tên vai trò <span class="text-red-500">*</span></label>
          <div v-if="isView" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-semibold text-slate-800">
            {{ form.role_name }}
          </div>
          <BaseInput
            v-else
            v-model="form.role_name"
            label=""
            size="small"
            placeholder="Enter role name"
            :hasError="nameError"
            message="Role name is required."
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox
            v-model="form.role_is_admin"
            inputId="role_is_admin"
            binary
            :disabled="isView"
          />
          <label for="role_is_admin" class="text-sm font-semibold text-slate-700">Quyền Admin</label>
        </div>

        <div class="space-y-2">
          <div class="text-sm font-semibold text-slate-700">Phân quyền theo menu</div>
          <div class="overflow-hidden rounded-2xl border border-slate-200">
            <div
              v-for="menu in menuOptions || []"
              :key="menu.value"
              class="border-b border-slate-200 last:border-b-0"
            >
              <div class="grid gap-3 px-4 py-4 md:grid-cols-[160px_1fr] md:items-start">
                <div class="text-sm font-semibold text-slate-700">
                  {{ menu.label }}
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
                  <label
                    v-for="action in permissionActions"
                    :key="`${menu.value}-${action.key}`"
                    class="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Checkbox
                      :modelValue="hasPermissionValue(menu.value, action.key)"
                      binary
                      :disabled="isView"
                      @update:modelValue="setPermissionValue(menu.value, action.key, $event)"
                    />
                    <span>{{ action.label }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div v-if="!menuOptions?.length" class="px-4 py-4 text-sm text-slate-500">
              No menu permissions available.
            </div>
          </div>
          <small v-if="menuError" class="block text-red-500">At least one menu is required.</small>
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
          label="Lưu"
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
