<template>
  <div class="dropdown">
    <select 
      id="language-select" 
      v-model="selectedLanguage" 
      @change="changeLanguage" 
      class="dropdown no-arrow"
    >
      <option v-for="item in items" :key="item" :value="item">
        {{ item }}
      </option>
    </select>
  </div>
</template>


<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const selectedLanguage = ref(props.items[0] || '')

function changeLanguage() {
  console.log('Language changed to:', selectedLanguage.value)
}
</script>



<style lang="css">
.dropdown {
  display: flex;
  justify-content: flex-end;
  color: white;
  background-color: transparent;
  font-weight: 600;
  font-size: 1rem;
  padding: 0rem 0.75rem;
  border: none;
  width: 100px;
}

.dropdown:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);

}

.no-arrow {
  appearance: none;
}
</style>
