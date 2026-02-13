<script setup lang="ts">
import { useUserDataStore } from '@/stores/userDataStore'
import { RouterLink, useRouter, useRoute } from 'vue-router'

const store = useUserDataStore()
const router = useRouter()
const route = useRoute()

const isActive = (path: string) => {
  return route.path === path ? "active" : "";
};

</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand">Sport Map</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li v-if="store.jwt" class="nav-item">
            <RouterLink :class="`nav-link ${isActive('/')}`" to="/">Home</RouterLink>
          </li>
          <li v-if="store.jwt" class="nav-item">
            <RouterLink :class="`nav-link ${isActive('/gpssessions')}`" to="/gpssessions">GPS Sessions</RouterLink>
          </li>
          <li v-if="store.jwt" class="nav-item">
            <RouterLink :class="`nav-link ${isActive('/usergpssessions')}`" to="/usergpssessions">User's GPS Sessions
            </RouterLink>
          </li>
        </ul>

        <ul v-if="!store.jwt" class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link active" to="/register">Register</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link active" to="/login">Login</RouterLink>
          </li>
        </ul>

        <ul v-else class="navbar-nav">
          <li class="nav-item">
            <a @click="
              () => {
                store.jwt = ''
                router.push('/')
              }
            " class="navbar-brand" href="#">Loggout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
