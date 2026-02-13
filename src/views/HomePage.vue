<script setup lang="ts">
import { computed } from 'vue'
import { useUserDataStore } from '@/stores/userDataStore'
import { useRouter } from 'vue-router'

const store = useUserDataStore()
const router = useRouter()

if (!store.jwt) {
  router.push('/login')
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const userName = computed(() => {
  return store.firstName || 'User'
})
</script>

<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1>{{ greeting }}, {{ userName }}! 👋</h1>
      <p>Welcome to GPS Session Tracker</p>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3>📍 Track Your Journey</h3>
        <p>Create GPS sessions and add location points to track your routes and adventures.</p>
      </div>

      <div class="info-card">
        <h3>🗺️ View on Map</h3>
        <p>Visualize your GPS data on interactive maps with detailed route information.</p>
      </div>

      <div class="info-card">
        <h3>📊 Manage Sessions</h3>
        <p>Browse, edit, and organize all your GPS tracking sessions in one place.</p>
      </div>

      <div class="info-card">
        <h3>🎯 Easy Navigation</h3>
        <p>Use the navigation menu to access all features and manage your GPS data.</p>
      </div>
    </div>
  </div>
</template>

<style>
.home-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
}

.welcome-section {
  text-align: center;
  background: linear-gradient(0deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
  color: white;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 2rem;
  margin-top: 2rem;
}

.welcome-section h1 {
  font-size: 3rem;
  margin-bottom: 0.5em;
}

.welcome-section p {
  font-size: 1.25rem;
  margin-bottom: 1em;
  margin-right: 1em;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.info-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}


.info-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(0deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
}
</style>
