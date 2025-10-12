<script setup>
import { ref } from 'vue'
import Dropdown from '@/components/DropdownApp.vue'
const languages = ref(['English', '日本語', 'Русский', '中国人', '한국인'])
const version = import.meta.env.VITE_APP_VERSION
</script>

<template>
  <div id="App">
    <header class="home-header">
      <nav class="language">
        <Dropdown title="Language" :items="languages" />
      </nav>
    </header>

    <main class="app-container">
      <div class="page-container">
        <div class="home-content">
          <div class="notice-header">
            <h1 class="notice-title">IMPORTANT NOTICE</h1>
            <h2 class="notice-subtitle">In accordance to Immigration Act, B.E. 2522</h2>
          </div>

          <ol class="specifications">
            <li>All passengers must complete the Thailand Digital Arrival Card.</li>
            <li>If the alien stays in the Kingdom longer than 90 days, he/she must notify
              in writing the nearest Immigration Officer, concerning place of stay, as soon as possible upon expiration
              of 90 days. And required to do so every 90 days.</li>
            <li>Aliens are not allowed to work unless they are granted Work Permit.</li>
            <li>Foreigners are required to submit their arrival card information 3 days
              in advance of their arrival date in Thailand.</li>
          </ol>

          <div class="home-actions">
            <router-link to="/new/personal-information" custom v-slot="{ navigate }">
              <button @click="navigate" role="link" class="btn btn-menu">
                <span class="btn-menu-title">Arrival Card</span>
                <span class="btn-menu-subtitle">Provide your Thailand Digital Arrival Card details for your coming
                  trip.</span>
              </button>
            </router-link>
            <router-link to="/update/search" custom v-slot="{ navigate }">
              <button @click="navigate" role="link" class="btn btn-menu">
                <span class="btn-menu-title">Update Arrival Card</span>
                <span class="btn-menu-subtitle">Make change to the Thailand Digital Arrival Card information.</span>
              </button>
            </router-link>
          </div>

          <div class="home-footer">
            <a href="https://tdac.immigration.go.th/manual/en/index.html" class="footer-link" target="_blank"
              rel="noopener noreferrer">
              User's Guide
            </a>
            <p class="footer-text">
              Copyright 2025 Project. All rights reserved.<br>
              Version {{ version }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.language {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
