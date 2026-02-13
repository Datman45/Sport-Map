<script setup lang="ts">
import { GpsLocationService } from '@/services/GpsLocationService'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IGpsLocation } from '@/types/domain/IGpsLocation'
import type { IResultObject } from '@/types/IResultObject'
import { GpsSessionService } from '@/services/GpsSessionService'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import L from 'leaflet'
import { useUserDataStore } from '@/stores/userDataStore'

const router = useRouter()

// push to login if user is not authenticated
const store = useUserDataStore()

if (!store.jwt) {
  router.push('/login')
}

// fetch Data from the API
const gpsLocationService = new GpsLocationService()
const gpsSessionService = new GpsSessionService()

const gpsLocationDataBySessionId = reactive<IResultObject<IGpsLocation[]>>({})
const gpsSessionDataById = reactive<IResultObject<IGpsSession>>({})

const route = useRoute()
const id = route.params.id as string

const fetchLocations = async () => {
  try {
    const locations = await gpsLocationService.getByIdAsync("Session/" + id)

    if (Array.isArray(locations.data)) {
      gpsLocationDataBySessionId.data = locations.data
    } else if (locations.data) {
      gpsLocationDataBySessionId.data = [locations.data]
    } else {
      gpsLocationDataBySessionId.data = []
    }

    gpsLocationDataBySessionId.errors = locations.errors
  } catch (error) {
    console.error('Error fetching GPS locations:', error)
    gpsLocationDataBySessionId.data = []
    gpsLocationDataBySessionId.errors = ['Failed to load GPS locations']
  }
}

const fetchDataBySessionId = async () => {
  try {
    const sessionData = await gpsSessionService.getByIdAsync(id)
    gpsSessionDataById.data = sessionData.data
  } catch (error) {
    console.error('Error fetching GPS session by id:', error)
  }
}

// initialize the map
const lat = ref(0)
const lng = ref(0)
const map = ref()
const mapContainer = ref()

const initializeMap = () => {
  if (!gpsLocationDataBySessionId.data || gpsLocationDataBySessionId.data.length === 0) {
    console.warn('No GPS data available for map initialization')
    return
  }

  const firstLocation = gpsLocationDataBySessionId.data[0]
  lat.value = firstLocation.latitude
  lng.value = firstLocation.longitude

  map.value = L.map(mapContainer.value).setView([lat.value, lng.value], 15)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value)

  const sortedLocations = [...gpsLocationDataBySessionId.data].sort((a, b) =>
    new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  const latlngs: [number, number][] = [];
  for (const location of sortedLocations) {
    latlngs.push([location.latitude, location.longitude]);
  }

  L.marker([latlngs[0][0], latlngs[0][1]])
    .addTo(map.value)
    .bindTooltip("Start Point", { permanent: true });

  L.marker([latlngs[latlngs.length - 1][0], latlngs[latlngs.length - 1][1]])
    .addTo(map.value)
    .bindTooltip("End Point", { permanent: true });

  const polyline = L.polyline(latlngs).addTo(map.value);

  map.value.fitBounds(polyline.getBounds());
}


// Auto-reload functionality
const autoReloadInterval = ref()
const refreshTime = ref(30)

const refreshMap = async () => {
  await fetchLocations()

  if (map.value) {
    map.value.remove()
    map.value = null
  }

  if (mapContainer.value) {
    initializeMap()
  }

  console.log('Refreshed with interval:', refreshTime.value * 1000, 'ms');
}

const startAutoReload = () => {
  autoReloadInterval.value = setInterval(refreshMap, refreshTime.value * 1000)
}

const stopAutoReload = () => {
  if (autoReloadInterval.value) {
    clearInterval(autoReloadInterval.value)
    autoReloadInterval.value = null
  }
}

const setRefreshTime = (time: number) => {
  if (time < 10) {
    refreshTime.value = 10
  } else {
    refreshTime.value = time
  }

  stopAutoReload()
  startAutoReload()

  console.log('Refresh time updated to:', refreshTime.value * 1000, 'ms')
}

// Lifecycle hooks
onMounted(async () => {
  await fetchLocations()
  await fetchDataBySessionId()
  if (mapContainer.value) {
    initializeMap()
  }

  startAutoReload()
})

onUnmounted(() => {
  stopAutoReload()
})

</script>

<template>
  <div class="map-view">
    <h1>Map View for Session: {{ gpsSessionDataById.data?.name }}</h1>

    <div class="description-container">
      <h3>Description:</h3>
      <span class="description-text">{{ gpsSessionDataById.data?.description }}</span>
    </div>
    <div>
      <input class="refreshTimer" type="number" v-model="refreshTime" />
      <button class="btn btn-primary" @click="setRefreshTime(refreshTime)">
        Set Refresh Time
      </button>
      <button class="btn btn-secondary ms-2" @click="$router.back()">
        Back
      </button>
    </div>

    <div v-if="gpsLocationDataBySessionId.errors && gpsLocationDataBySessionId.errors.length > 0"
      class="alert alert-danger">
      <div v-for="error in gpsLocationDataBySessionId.errors" :key="error">{{ error }}</div>
    </div>
    <div v-if="!gpsLocationDataBySessionId.data" class="loading">
      Loading GPS locations...
    </div>

    <div v-else-if="gpsLocationDataBySessionId.data.length > 0">
      <p>Found {{ gpsLocationDataBySessionId.data.length }} GPS location(s)</p>
    </div>
    <div v-else>
      <p>No GPS locations found for this session.</p>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>
