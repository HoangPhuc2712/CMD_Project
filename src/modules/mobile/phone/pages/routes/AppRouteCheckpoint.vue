<template>
  <section class="min-h-screen bg-sky-50 px-4 py-4">
    <div class="mx-auto flex min-h-[calc(100vh-2rem)] flex-col gap-4">
      <PageTopbar title="Patrol Report" />

      <div class="rounded-[20px] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div class="flex flex-col gap-2">
          <p class="m-0 text-2xl font-bold text-slate-900">{{ checkpointDetail.name }}</p>
          <div class="flex flex-col">
            <p class="m-0 text-base font-light text-slate-700">
              Area: <span class="font-semibold">{{ checkpointDetail.area }}</span>
            </p>
            <p class="m-0 text-base font-light text-slate-700">
              Shift: <span class="font-semibold">{{ formattedShift }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="pb-4">
        <p v-if="errorMessage" class="mb-3 text-center text-[13px] font-semibold text-red-600">
          {{ errorMessage }}
        </p>

        <BaseIconButton
          icon="pi pi-camera !text-[18px]"
          label="Checkin Photo"
          size="large"
          class="h-[56px] w-full !rounded-[18px] !text-[18px]"
          :loading="capturing"
          @click="onTakeCheckinPhoto"
        />

        <div v-if="photos.length" class="mt-4">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="overflow-hidden rounded-[18px] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
          >
            <img :src="photo.previewUrl" :alt="photo.label" class="h-100 w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import BaseIconButton from '@/components/common/buttons/BaseIconButton.vue'
import PageTopbar from '@/modules/mobile/shared/PageTopbar.vue'

type CheckpointDetail = {
  id: string
  name: string
  area: string
  shift: string
}

type CheckinPhoto = {
  id: string
  label: string
  previewUrl: string
}

const route = useRoute()

const capturing = ref(false)
const errorMessage = ref('')
const photos = ref<CheckinPhoto[]>([])

const checkpointDetail = computed<CheckpointDetail>(() => {
  const checkpointId = String(route.params.checkpointId || 'cp-01')
  const name = String(route.query.name || 'VP-01')
  const area = String(route.query.area || 'Factory Area A')
  const shift = String(route.query.shift || '08:00')

  return {
    id: checkpointId,
    name,
    area,
    shift,
  }
})

const formattedShift = computed(() => formatShiftTime(checkpointDetail.value.shift))

function formatShiftTime(value: string) {
  const trimmedValue = value.trim()
  const timeMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})$/)

  if (!timeMatch) {
    return trimmedValue
  }

  const hours = Number(timeMatch[1])
  const minutes = timeMatch[2]
  const period = hours >= 12 ? 'PM' : 'AM'
  const normalizedHours = hours % 12 || 12

  return `${normalizedHours}:${minutes} ${period}`
}

async function takeCheckinPhoto() {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 85,
  })

  const previewUrl = photo.webPath || (photo.path ? Capacitor.convertFileSrc(photo.path) : '')

  if (!previewUrl) {
    throw new Error('CHECKIN_PHOTO_UNAVAILABLE')
  }

  return previewUrl
}

async function onTakeCheckinPhoto() {
  errorMessage.value = ''
  capturing.value = true

  try {
    const previewUrl = await takeCheckinPhoto()

    photos.value.unshift({
      id: `${checkpointDetail.value.id}-${Date.now()}`,
      label: `Checkin ${photos.value.length + 1}`,
      previewUrl,
    })
  } catch (error: any) {
    if (error?.message === 'User cancelled photos app') {
      errorMessage.value = ''
      return
    }

    errorMessage.value =
      error?.message === 'CHECKIN_PHOTO_UNAVAILABLE'
        ? 'Checkin photo could not be loaded'
        : 'Camera is unavailable or permission was denied'
  } finally {
    capturing.value = false
  }
}
</script>
