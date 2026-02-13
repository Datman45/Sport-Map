<script setup lang="ts">
import { IdentityService } from '@/services/IdentityServices'
import { ref } from 'vue'
import { useUserDataStore } from '@/stores/userDataStore'
import router from '@/router'

const store = useUserDataStore()

// register function
const email = ref('')
const firstName = ref('')
const lastName = ref('')
const password = ref('')
const confirmPassword = ref('')

const error = ref('')
const requestIsOngoing = ref(false)

const doRegister = async () => {
  error.value = ''

  const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password.value)
  if (!hasNonAlphanumeric) {
    error.value = 'Password must have at least one non-alphanumeric character (e.g., !, @, #, $, etc.)'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    requestIsOngoing.value = true

    const response = await IdentityService.register(
      email.value,
      password.value,
      firstName.value,
      lastName.value,
    )

    if (response.data) {
      store.jwt = response.data.token
      store.firstName = response.data.firstName
      store.lastName = response.data.lastName
      router.push({ name: 'Home' })
    } else {
      error.value = 'User already registered!'
    }

  } catch (err) {
    console.error('Registration error:', err)
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
    <form @submit.prevent="doRegister">
      <div class="form-group">
        <input v-model="email" type="email" class="form-control mw-300" id="inputEmail" placeholder="Email" required
          maxlength="256" />
      </div>

      <div class="form-group">
        <input v-model="firstName" type="text" class="form-control mw-300" id="inputFirstName" placeholder="First Name"
          required maxlength="128" />
      </div>

      <div class="form-group">
        <input v-model="lastName" type="text" class="form-control mw-300" id="inputLastName" placeholder="Last Name"
          required maxlength="128" />
      </div>

      <div class="form-group">
        <input v-model="password" type="password" class="form-control mw-300" id="inputPassword" placeholder="Password"
          required minlength="6" maxlength="100" />
      </div>

      <div class="form-group">
        <input v-model="confirmPassword" type="password" class="form-control mw-300" id="inputConfirmPassword"
          placeholder="Confirm Password" required />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>

  </div>
</template>
