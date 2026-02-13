<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { IResultObject } from '@/types/IResultObject'
import { GpsSessionService } from '@/services/GpsSessionService'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import router from '@/router'
import { useUserDataStore } from '@/stores/userDataStore'

const data = reactive<IResultObject<IGpsSession[]>>({})
const error = ref<string | null>(null)

const minLocationsCount = ref(10)
const minDuration = ref(60)
const minDistance = ref(10)
const dateFrom = ref('')
const dateTo = ref('')

// push to login if user is not authenticated
const store = useUserDataStore()

if (!store.jwt) {
  router.push("/login")
}

// Fetch GPS sessions data
const gosSessionService = new GpsSessionService()

const requestIsOngoing = ref(false)

const fetchPageData = async () => {
  requestIsOngoing.value = true
  error.value = null

  let toDate = dateTo.value
  if (toDate) {
    const date = new Date(toDate)
    date.setDate(date.getDate() + 1)
    toDate = date.toISOString().split('T')[0]
  }
  try {
    const result = await gosSessionService.getAllAsync({
      minLocationsCount: minLocationsCount.value,
      minDistance: minDistance.value,
      minDuration: minDuration.value,
      fromDateTime: dateFrom.value,
      toDateTime: toDate,
    })
    data.data = result.data
    data.errors = result.errors
  } catch (err) {
    console.error('Error fetching GPS sessions:', err)
    error.value = 'Failed to load GPS sessions. Please try again.'
  } finally {
    requestIsOngoing.value = false
  }
}

// filters and search functionality
const searchByName = ref('')

const applyFilters = () => {
  fetchPageData()
}

const resetFilters = () => {
  minLocationsCount.value = 10
  minDuration.value = 60
  minDistance.value = 10
  dateFrom.value = ''
  dateTo.value = ''
  searchByName.value = ''
  fetchPageData()
}

const filteredData = computed(() => {
  if (!data.data) return []

  if (!searchByName.value.trim()) {
    return data.data
  }

  const searchTerm = searchByName.value.toLowerCase().trim()

  return data.data.filter(item =>
    item.name?.toLowerCase().includes(searchTerm) ||
    item.description?.toLowerCase().includes(searchTerm) ||
    item.userFirstLastName?.toLowerCase().includes(searchTerm)
  )
})

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


// Navigate to map view for a specific GPS session
const toMapView = (id: string) => {
  router.push({ name: 'GpsSessionMap', params: { id } })
}

// lifecycle hook
onMounted(async () => {
  await fetchPageData()
})
</script>

<template>
  <div class="gps-session-container">
    <h1>GPS Sessions</h1>

    <form class="gps-sessions-filters" @submit.prevent="applyFilters">
      <div class="search-container">
        <div class="filter-item searchBar">
          <label>Search:</label>
          <input v-model="searchByName" type="text" placeholder="Search by name, description, or user..."
            aria-label="Search GPS sessions" />
        </div>
      </div>
      <div class="filters-row">
        <div class="filter-item">
          <label>Locations (min):</label>
          <input v-model="minLocationsCount" type="number" placeholder="0" />
        </div>

        <div class="filter-item">
          <label>Duration (min):</label>
          <input v-model="minDuration" type="number" placeholder="0" />
        </div>

        <div class="filter-item">
          <label>Distance (min):</label>
          <input v-model="minDistance" type="number" placeholder="0" step="0.1" />
        </div>

        <div class="filter-item">
          <label>Date from:</label>
          <input v-model="dateFrom" type="date" />
        </div>

        <div class="filter-item">
          <label>Date to:</label>
          <input v-model="dateTo" type="date" />
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">Apply</button>
        </div>
        <div>
          <button type="button" class="btn btn-secondary" @click="resetFilters">Reset</button>
        </div>
      </div>
    </form>


    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-if="requestIsOngoing" class="loading">
      Loading GPS sessions...
    </div>

    <div v-else class="gpsSessionTable">

      <div v-if="searchByName && filteredData.length !== data.data?.length" class="search-info">
        Showing {{ filteredData.length }} of {{ data.data?.length }} sessions
      </div>

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
          <tr v-for="item in filteredData" :key="item.id">
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
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!filteredData.length && searchByName" class="empty-state">
        <p>No GPS sessions found matching "{{ searchByName }}"</p>
        <button @click="searchByName = ''" class="btn btn-secondary">Clear search</button>
      </div>
    </div>
  </div>
</template>

<style>
.search-container {
  margin-bottom: 1rem;
}

.search-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  color: #495057;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.filters-row {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  width: none;
}

.filter-item.searchBar {
  width: 41.5%;
}

.filter-item label {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.filter-item input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
}
</style>
