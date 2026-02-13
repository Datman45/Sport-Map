<script setup lang="ts">
import Header from '@/components/HeaderNav.vue'
import Footer from '@/components/FooterNav.vue'
</script>

<template>
  <Header />

  <main class="app-container">
    <RouterView />
  </main>

  <Footer />
</template>

<style>
.app-container {
  margin-top: 1rem;
}
</style>
