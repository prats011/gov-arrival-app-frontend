<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="app-container">
    <div class="page-container">
      <div class="success-container">
        <h1 class="success-message">
          WELL DONE<br>
          YOU HAVE COMPLETED THE ARRIVAL CARD PROCESS
        </h1>
        <button @click="goHome" class="btn btn-primary btn-large">
          Click here to go back to home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only if needed */
</style>
