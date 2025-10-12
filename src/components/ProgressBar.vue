<script setup>
import { inject } from 'vue'
const count = inject('globalCount')

</script>


<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress">
        <div class="progress-circles" :class="{ 'highlited': count >= 0 }">1</div>
        <div class="progress-text">Personal Information</div>
      </div>
      <hr class="line" :class="{ 'highlited': count >= 1 }">
      <div class="progress">
        <div class="progress-circles" :class="{ 'highlited': count >= 1 }">2</div>
        <div class="progress-text">Trip & Accommodation<br> Information</div>
      </div>
      <hr class="line" :class="{ 'highlited': count >= 2 }">
      <div class="progress">
        <div class="progress-circles" :class="{ 'highlited': count >= 2 }">3</div>
        <div class="progress-text">Health Declaration</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
  margin-bottom: 30px;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: inherit;
  margin: 0;
}

.progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 30px 0;
  background-color: transparent;
}

.progress-circles {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background-color: #e5e7eb;
}

.progress-text {
  display: inline-flex;
  text-align: center;
  line-height: 1.3;
  font-weight: 200;
  font-size: 12px;
  color: rgb(27, 108, 163);
}

.line {
  padding: 2px 150px;
  background-color: #e5e7eb;
  border: none;
  margin: 0;
  margin-bottom: 32px;
  /* How to allow overflow of the line in the progress container*/
}

.highlited {
  background-color: rgb(27, 108, 163);
  color: #FFF;
  transition: background-color 1s ease-in-out;
  /*transition: background-color 1s ease-in-out; */
}
</style>
