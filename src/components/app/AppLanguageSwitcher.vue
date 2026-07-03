<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import { isMobilePlatform } from '@/services/platform/platform.service'
import { setAppLocale, type AppLocale } from '@/plugins/i18n'

const HEADER_POPOVER_OPEN_EVENT = 'header-popover-open'
const HEADER_POPOVER_SOURCE = 'language-switcher'

const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const open = ref(false)
const isPinnedOpen = ref(false)
const { t, locale } = useI18n()
const route = useRoute()

type LanguageOption = { code: AppLocale; flagSrc: string }

const fallbackLanguage: LanguageOption = { code: 'en', flagSrc: '/flagIcon/en.svg' }

const languages: LanguageOption[] = [
  { code: 'en', flagSrc: '/flagIcon/en.svg' },
  { code: 'vi', flagSrc: '/flagIcon/vi.svg' },
  { code: 'zh-CN', flagSrc: '/flagIcon/zh-CN.svg' },
  { code: 'zh-TW', flagSrc: '/flagIcon/zh-TW.svg' },
]

const currentLanguage = computed<LanguageOption>(() => {
  return languages.find((item) => item.code === locale.value) ?? fallbackLanguage
})

const currentLanguageLabel = computed(() => {
  return t(`languageSwitcher.languages.${currentLanguage.value.code}`)
})

const showLanguageLabel = computed(() => !isMobilePlatform())
const popoverWidthClass = computed(() => (isMobilePlatform() ? 'w-full' : 'w-48'))
const triggerButtonClass = computed(() =>
  isMobilePlatform()
    ? '!rounded-xl !border-slate-200 !bg-white !px-2 !py-1 !text-sm !text-slate-700 !shadow-sm transition hover:!bg-slate-50 hover:cursor-pointer'
    : '!rounded-xl !border-slate-200 !bg-white !px-3 !py-2 !text-sm !text-slate-700 !shadow-sm transition hover:!bg-slate-50 hover:cursor-pointer',
)
const flagImageClass = computed(() => (isMobilePlatform() ? '!h-6 !w-6' : '!h-4 !w-4'))

let hoverLeaveTimer: number | null = null

function clearHoverLeaveTimer() {
  if (hoverLeaveTimer != null) {
    window.clearTimeout(hoverLeaveTimer)
    hoverLeaveTimer = null
  }
}

function getLanguageLabel(item: LanguageOption) {
  return t(`languageSwitcher.languages.${item.code}`)
}

function notifyPopoverOpen() {
  window.dispatchEvent(
    new CustomEvent(HEADER_POPOVER_OPEN_EVENT, {
      detail: { source: HEADER_POPOVER_SOURCE },
    }),
  )
}

function openPopover() {
  clearHoverLeaveTimer()
  notifyPopoverOpen()
  open.value = true
}

function closePopover() {
  clearHoverLeaveTimer()
  open.value = false
  isPinnedOpen.value = false
}

function onTriggerMouseEnter() {
  if (isPinnedOpen.value) return
  openPopover()
}

function onTriggerMouseLeave() {
  if (isPinnedOpen.value) return
  clearHoverLeaveTimer()
  hoverLeaveTimer = window.setTimeout(() => {
    if (!isPinnedOpen.value) {
      open.value = false
    }
  }, 120)
}

function onPopoverMouseEnter() {
  if (isPinnedOpen.value) return
  openPopover()
}

function onPopoverMouseLeave() {
  if (isPinnedOpen.value) return
  clearHoverLeaveTimer()
  hoverLeaveTimer = window.setTimeout(() => {
    if (!isPinnedOpen.value) {
      open.value = false
    }
  }, 120)
}

function toggleOpen() {
  clearHoverLeaveTimer()

  if (isPinnedOpen.value) {
    closePopover()
    return
  }

  notifyPopoverOpen()
  isPinnedOpen.value = true
  open.value = true
}

function selectLanguage(code: AppLocale) {
  setAppLocale(code)
  closePopover()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  closePopover()
}

function handleExternalPopoverOpen(event: Event) {
  const customEvent = event as CustomEvent<{ source?: string }>
  if (customEvent.detail?.source === HEADER_POPOVER_SOURCE) return
  closePopover()
}

watch(
  () => route.fullPath,
  () => {
    closePopover()
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener(HEADER_POPOVER_OPEN_EVENT, handleExternalPopoverOpen as EventListener)
})

onBeforeUnmount(() => {
  clearHoverLeaveTimer()
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener(HEADER_POPOVER_OPEN_EVENT, handleExternalPopoverOpen as EventListener)
})
</script>

<template>
  <div ref="rootRef" class="relative shrink-0">
    <div ref="triggerRef" @mouseenter="onTriggerMouseEnter" @mouseleave="onTriggerMouseLeave">
      <BaseIconButton
        :label="showLanguageLabel ? currentLanguageLabel : ''"
        :imageSrc="currentLanguage.flagSrc"
        imageAlt="Current language"
        :imageClass="flagImageClass"
        severity="secondary"
        outlined
        :class="triggerButtonClass"
        @click="toggleOpen"
      >
      </BaseIconButton>
    </div>

    <div
      v-if="open"
      ref="popoverRef"
      :class="[
        'absolute right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg',
        popoverWidthClass,
      ]"
      @mouseenter="onPopoverMouseEnter"
      @mouseleave="onPopoverMouseLeave"
    >
      <BaseIconButton
        v-for="item in languages"
        :key="item.code"
        :label="showLanguageLabel ? getLanguageLabel(item) : ''"
        :imageSrc="item.flagSrc"
        :imageAlt="getLanguageLabel(item)"
        :imageClass="flagImageClass"
        contentClass="inline-flex w-full items-center gap-2"
        text
        class="w-full !justify-start !rounded-none !px-2 !py-1 !text-left !text-sm !font-normal !text-slate-700 transition hover:!bg-slate-50"
        :class="item.code === locale ? '!bg-slate-50 !font-medium' : ''"
        @click="selectLanguage(item.code)"
      />
    </div>
  </div>
</template>
