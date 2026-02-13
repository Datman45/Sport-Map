<script setup lang="ts">
import { GpsLocationService } from '@/services/GpsLocationService'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IGpsLocation } from '@/types/domain/IGpsLocation'
import type { IResultObject } from '@/types/IResultObject'
import { GpsSessionService } from '@/services/GpsSessionService'
import type { IGpsSession } from '@/types/domain/IGpsSession'
import L from 'leaflet'
import { useUserDataStore } from '@/stores/userDataStore'

declare global {
  interface Window {
    deleteGpsLocation?: (id: string) => void
  }
}

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

  map.value = L.map(mapContainer.value).setView([59.4370, 24.7536], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);

  map.value.on('click', (e: { latlng: { lat: number; lng: number } }) => {
    L.marker([e.latlng.lat, e.latlng.lng])
      .addTo(map.value)

    postGpsLocation(id, e.latlng.lat, e.latlng.lng)

  })

  if (gpsLocationDataBySessionId.data && gpsLocationDataBySessionId.data.length > 0) {
    const firstLocation = gpsLocationDataBySessionId.data[0]
    lat.value = firstLocation.latitude
    lng.value = firstLocation.longitude


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

    window.deleteGpsLocation = deleteGpsLocation
    for (const location of sortedLocations) {
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(map.value)
        .bindPopup(`<button onClick="window.deleteGpsLocation('${location.id}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
        Delete
        </button>`);

      marker.dragging?.enable()

      if (marker.dragging) {
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng();
          updateGpsLocation(location, newLatLng.lat, newLatLng.lng);
          marker.setLatLng(newLatLng);
        });
      }
    }

  }

}

// Functions to post, put and delete a GPS location
const postGpsLocation = async (id: string, latitude: number, longitude: number) => {
  try {
    const locationData = {
      recordedAt: new Date().toISOString(),
      latitude: latitude,
      longitude: longitude,
      accuracy: 0,
      altitude: 0,
      verticalAccuracy: 0,
      gpsLocationTypeId: "00000000-0000-0000-0000-000000000001"
    }

    const result = await gpsLocationService.addAsync(locationData as IGpsLocation, id)

    updateMap()

    if (result.data) {
      console.log('GPS location posted successfully:', result.data)
      await fetchLocations()
    } else {
      console.error('Failed to post GPS location:', result.errors)
    }
  } catch (error) {
    console.error('Error posting GPS location:', error)
  }
}

const deleteGpsLocation = async (id: string) => {
  console.log('Deleting GPS location with ID:', id)
  try {
    const result = await gpsLocationService.deleteAsync(id)

    if (result.data || !result.errors?.length) {
      console.log('GPS location deleted successfully:', result.data)

      updateMap()

    } else {
      console.error('Failed to delete GPS location:', result.errors)
    }
  } catch (error) {
    console.error('Error deleting GPS location:', error)
  }
}

const updateGpsLocation = async (location: IGpsLocation, latitude: number, longitude: number) => {
  try {
    const locationData = {
      id: location.id,
      recordedAt: location.recordedAt,
      latitude: latitude,
      longitude: longitude,
      accuracy: location.accuracy,
      altitude: location.altitude,
      verticalAccuracy: location.verticalAccuracy,
      appUserId: location.appUserId,
      gpsSessionId: location.gpsSessionId,
      gpsLocationTypeId: location.gpsLocationTypeId
    }

    const result = await gpsLocationService.updateAsync(location.id, locationData as IGpsLocation)

    updateMap()

    if (result.data) {
      console.log('GPS location posted successfully:', result.data)
      await fetchLocations()
    } else {
      console.error('Failed to post GPS location:', result.errors)
    }
  } catch (error) {
    console.error('Error posting GPS location:', error)
  }
}

async function updateMap() {
  await fetchLocations()
  if (map.value) {
    map.value.remove()
    map.value = null
  }
  if (mapContainer.value) {
    initializeMap()
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchLocations()
  await fetchDataBySessionId()
  if (mapContainer.value) {
    initializeMap()
  }
})
</script>

<template>
  <div class="map-view">
    <h1>Map View for Session: {{ gpsSessionDataById.data?.name }}</h1>

    <div class="description-container">
      <h3>Description:</h3>
      <span class="description-text">{{ gpsSessionDataById.data?.description }}</span>
    </div>
    <button class="btn btn-secondary" @click="$router.back()">
      Back
    </button>
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
    <p>Add: click on the map, Delete: click on the marker, Edit: drag marker</p>
  </div>
</template>
