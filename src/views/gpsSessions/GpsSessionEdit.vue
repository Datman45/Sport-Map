<script setup lang="ts">
import { GpsSessionService } from '@/services/GpsSessionService'
import { GpsSessionTypeService } from '@/services/GpsSessionTypeService'
import type { IGpsSessionType } from '@/types/domain/IGpsSessionType'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IResultObject } from '@/types/IResultObject'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import router from '@/router'
import { useUserDataStore } from '@/stores/userDataStore'

const error = ref<string | null>(null)
const requestIsOngoing = ref(false)

const name = ref('')
const description = ref('')
const recordedAt = ref('')
const paceMin = ref(0)
const paceMax = ref(0)
const gpsSessionType = ref('')

// push to login if user is not authenticated
const store = useUserDataStore()
if (!store.jwt) {
  router.push('/login')
}

// get the session by ID
const gpsSessionService = new GpsSessionService()
const route = useRoute()
const id = route.params.id as string

const getSessionById = async (id: string) => {
  requestIsOngoing.value = true
  try {
    const response = await gpsSessionService.getByIdAsync(id)
    if (response.data) {
      const sessionData = response.data as IGpsSession
      name.value = sessionData.name
      description.value = sessionData.description
      recordedAt.value = sessionData.recordedAt
      paceMin.value = sessionData.paceMin
      paceMax.value = sessionData.paceMax

      const gpsSessionTypeAsObject = JSON.parse(sessionData.gpsSessionType)
      const sessionTypeName = gpsSessionTypeAsObject.en

      if (sessionTypes.data) {
        const found = sessionTypes.data.find((type) => type.name === sessionTypeName)
        gpsSessionType.value = found ? found.id : ''
      }
    }
  } catch (error) {
    console.log('Error fetching session by ID:', error)
  } finally {
    requestIsOngoing.value = false
  }
}


// fetch session types for the dropdown
const sessionTypeService = new GpsSessionTypeService()
const sessionTypes = reactive<IResultObject<IGpsSessionType[]>>({})

const fetchPageData = async () => {
  requestIsOngoing.value = true
  try {
    const result = await sessionTypeService.getAllAsync()
    sessionTypes.data = result.data
    sessionTypes.errors = result.errors
  } catch (error) {
    console.log('Error fetching session types', error)
  } finally {
    requestIsOngoing.value = false
  }
}

// Function to update the GPS session
async function updateSession() {
  error.value = ''
  if (paceMin.value < 60 || paceMax.value <= paceMin.value) {
    error.value = 'Pace Min must be more or equally to 60 and Pace Max must be more than Pace Min'
    return
  }

  const inputData = {
    id: id,
    name: name.value,
    description: description.value,
    recordedAt: recordedAt.value,
    paceMin: paceMin.value,
    paceMax: paceMax.value,
    gpsSessionTypeId: gpsSessionType.value,
  }

  try {
    await gpsSessionService.updateAsync(id, inputData as unknown as IGpsSession)
    router.push('/usergpssessions')
  } catch (error) {
    console.error('Error updating session:', error)
  }
}

//lifecycle hook
onMounted(async () => {
  await fetchPageData()
  await getSessionById(id)
})
</script>

<template>
  <div class="form-template">
    <form @submit.prevent="updateSession">
      <h2>Update Gps Session</h2>
      <div v-if="error" class="alert alert-danger mw-300" role="alert">
        {{ error }}
      </div>
      <div v-if="requestIsOngoing" class="loading">
        Loading GPS sessions...
      </div>
      <div v-else>
        <div class="mb-3">
          <label for="name" class="form-label">Name:</label>
          <input v-model="name" id="name" type="text" class="form-control mw-300" required maxlength="256" />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Description:</label>
          <textarea v-model="description" id="description" type="text" class="form-control mw-300" required
            maxlength="4096"></textarea>
        </div>

        <div class="mb-3">
          <label for="paceMin" class="form-label">Pace Min:</label>
          <input v-model="paceMin" id="paceMin" type="number" class="form-control mw-300" required />
        </div>

        <div class="mb-3">
          <label for="paceMax" class="form-label">Pace Max:</label>
          <input v-model="paceMax" id="paceMax" type="number" class="form-control mw-300" required />
        </div>

        <div class="mb-3">
          <label for="gpsSessionType" class="form-label">Session Type:</label>
          <select v-model="gpsSessionType" class="form-control mw-300" id="gpsSessionType" required>
            <option value="" disabled>Select a session type</option>
            <option v-for="type in sessionTypes.data" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-primary">Edit</button>
        <button class="btn btn-secondary ms-2" @click="$router.back()">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
