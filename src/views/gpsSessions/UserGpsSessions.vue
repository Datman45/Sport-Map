<script setup lang="ts">
import { GpsSessionService } from '@/services/GpsSessionService'
import { useUserDataStore } from '@/stores/userDataStore'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import type { IResultObject } from '@/types/IResultObject'
import { onMounted, reactive, ref } from 'vue'
import router from '@/router'

const gpsSessionService = new GpsSessionService()
const error = ref<string | null>(null)
const requestIsOngoing = ref(false)

const minLocationsCount = ref(0)
const minDistance = ref(0)
const minDuration = ref(0)

// push to login if user is not authenticated
const store = useUserDataStore()

if (!store.jwt) {
  router.push("/login")
}

// Fetch GPS sessions data
const gpsSessionData = reactive<IResultObject<IGpsSession[]>>({})

const fetchSessionData = async () => {
  requestIsOngoing.value = true
  error.value = null
  try {
    const result = await gpsSessionService.getAllAsync({
      minLocationsCount: minLocationsCount.value,
      minDistance: minDistance.value,
      minDuration: minDuration.value,

    })
    gpsSessionData.data = result.data
    gpsSessionData.errors = result.errors

  } catch (err) {
    console.error('Error fetching GPS sessions:', err)
    error.value = 'Failed to load GPS sessions. Please try again.'
  } finally {
    requestIsOngoing.value = false
  }
}

// Delete GPS session

const deleteGpsSession = async (id: string) => {
  if (!confirm('Are you sure you want to delete this GPS session?')) {
    return
  }

  requestIsOngoing.value = true

  try {
    await gpsSessionService.deleteAsync(id)
    await fetchSessionData()
  } catch (err) {
    console.error('Error deleting GPS session:', err)
    error.value = 'Failed to delete GPS session. Please try again.'
  } finally {
    requestIsOngoing.value = false
  }
}

// Function to get session type name from JSON string
const getSessionTypeName = (sessionType: string) => {
  try {
    return JSON.parse(sessionType).en || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

// change date format to local date string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}


// Navigation functions
const toMapView = (id: string) => {
  router.push({ name: 'UserGpsSessionMap', params: { id } })
}

const toUpdateGpsSessionPage = (id: string) => {
  router.push({ name: 'UserGpsSessionEdit', params: { id } })
}

// lifecycle hook
onMounted(() => {
  fetchSessionData()
})

</script>
<template>
  <div class="gps-session-container">
    <div class="actions">
      <RouterLink to="/usergpssessions/create" class="btn btn-primary">Create New</RouterLink>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-if="requestIsOngoing" class="loading">
      Loading GPS sessions...
    </div>

    <div v-else class="gpsSessionTable">

      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Recorded At</th>
            <th>Duration</th>
            <th>Speed</th>
            <th>Distance</th>
            <th>Min Pace</th>
            <th>Max Pace</th>
            <th>Session Type</th>
            <th>Locations</th>
            <th>User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in gpsSessionData.data?.filter(i => i.userFirstLastName === store.firstName + ' ' + store.lastName)"
            :key="item.id">
            <td style="max-width: 150px;">{{ item.name }}</td>
            <td style="max-width: 200px;">{{ item.description }}</td>
            <td>{{ formatDate(item.recordedAt) }}</td>
            <td>{{ item.duration }}</td>
            <td>{{ item.speed }}</td>
            <td style="max-width: 200px;">{{ item.distance }}</td>
            <td>{{ item.paceMin }} </td>
            <td> {{ item.paceMax }}</td>
            <td>{{ getSessionTypeName(item.gpsSessionType) }}</td>
            <td>{{ item.gpsLocationsCount }}</td>
            <td style="max-width: 100px;">{{ item.userFirstLastName }}</td>
            <td class="actions-cell">
              <button class="btn btn-sm btn-primary me-2" @click="toMapView(item.id)" title="Map view">
                Map view
              </button>
              <button class="btn btn-sm btn-primary me-2" @click="toUpdateGpsSessionPage(item.id)"
                title="Update GPS Session">
                Update
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteGpsSession(item.id)" title="Delete GPS Session">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
