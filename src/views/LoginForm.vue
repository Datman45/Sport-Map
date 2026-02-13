<script setup lang="ts">
import { ref } from 'vue'
import { useUserDataStore } from '@/stores/userDataStore'
import { IdentityService } from '@/services/IdentityServices'
import { useRouter } from 'vue-router'

const router = useRouter()

// login function
const email = ref('')
const password = ref('')

const error = ref('')
const store = useUserDataStore()

const requestIsOngoing = ref(false)
const doLogin = async () => {

  try {
    requestIsOngoing.value = true
    error.value = ''

    const response = await IdentityService.login(email.value, password.value)

    if (response.data) {
      store.jwt = response.data.token
      store.firstName = response.data.firstName
      store.lastName = response.data.lastName
      router.push({ name: 'Home' })
    }
    else {
      error.value = 'User not found!'
    }

  } catch (err) {
    console.error('Login error:', err)
  } finally {
    requestIsOngoing.value = false
  }
}
</script>

<template>
  <div class="form-template">
    <div v-if="error" class="alert alert-danger mw-300" role="alert">
      {{ error }}
    </div>
    <div v-if="requestIsOngoing" class="loading">
      Loading...
    </div>
    <form @submit.prevent="doLogin">
      <div class="form-group">
        <input v-model="email" type="email" class="form-control mw-300" placeholder="Enter email" maxlength="256"
          required />
      </div>
      <div class="form-group">
        <input v-model="password" type="password" class="form-control mw-300" placeholder="Password (6-100 chars)"
          minlength="6" maxlength="100" required />
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>
