<script setup lang="ts">
import type { IGpsSessionType } from '@/types/domain/IGpsSessionType'
import { GpsSessionService } from '@/services/GpsSessionService'
import { GpsSessionTypeService } from '@/services/GpsSessionTypeService'
import type { IResultObject } from '@/types/IResultObject'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import { useUserDataStore } from '@/stores/userDataStore'
const router = useRouter()


// push to login if user is not authenticated
const store = useUserDataStore()
if (!store.jwt) {
  router.push('/login')
}

// Function to post a new GPS session
const service = new GpsSessionService()
const error = ref<string | null>(null)

const name = ref('')
const description = ref('')
const gpsSessionTypeId = ref('')
const recordedAt = new Date().toISOString()
const paceMin = ref(0)
const paceMax = ref(0)

async function postGpsSession() {
  error.value = ''
  if (paceMin.value < 60 || paceMax.value <= paceMin.value) {
    error.value = 'Pace Min must be more or equally to 60 and Pace Max must be more than Pace Min'
    return
  }

  const inputgpsSessionTypesData = {
    name: name.value,
    description: description.value,
    gpsSessionTypeId: gpsSessionTypeId.value,
    recordedAt,
    paceMin: paceMin.value,
    paceMax: paceMax.value,
  }

  const response = await service.addAsync(inputgpsSessionTypesData as unknown as IGpsSession)
  if (response.errors) {
    error.value = response.errors.join(', ')
  } else {
    router.push('/usergpssessions')
  }
}

// Fetch session types for the dropdown
const sessionTypeService = new GpsSessionTypeService()
const gpsSessionTypesData = reactive<IResultObject<IGpsSessionType[]>>({})

const requestIsOngoing = ref(false)
const fetchSessionTypes = async () => {
  requestIsOngoing.value = true
  try {
    const result = await sessionTypeService.getAllAsync()

    gpsSessionTypesData.data = result.data
    gpsSessionTypesData.errors = result.errors
  } catch (error) {
    console.log('Error fetching gpsSessionTypesData', error)
  } finally {
    requestIsOngoing.value = false
  }
}

// Lifecycle hook
onMounted(async () => {
  await fetchSessionTypes()
})
</script>

<template>
  <div class="form-template">
    <h2>GPS Session Create</h2>
    <div v-if="error" class="alert alert-danger mw-300" role="alert">
      {{ error }}
    </div>
    <form @submit.prevent="postGpsSession">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input v-model="name" type="text" class="form-control mw-300" id="name" required minlength="2"
          maxlength="256" />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea v-model="description" type="text" class="form-control mw-300" id="description" required minlength="2"
          maxlength="4096"></textarea>
      </div>
      <div class="mb-3">
        <label for="gpsSessionTypeId" class="form-label">Session Type</label>
        <select v-model="gpsSessionTypeId" class="form-control mw-300" id="gpsSessionTypeId" required>
          <option v-for="item in gpsSessionTypesData.data" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="paceMin" class="form-label">Pace Min:</label>
        <input v-model="paceMin" type="number" class="form-control mw-300" id="paceMin" />
      </div>
      <div class="mb-3">
        <label for="paceMax" class="form-label">Pace Max</label>
        <input v-model="paceMax" type="number" class="form-control mw-300" id="paceMax" />
      </div>
      <button type="submit" class="btn btn-primary">Create</button>
      <button class="btn btn-secondary ms-2" @click="$router.back()">
        Cancel
      </button>
    </form>
  </div>
</template>
