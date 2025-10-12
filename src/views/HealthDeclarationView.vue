<script setup>
import ProgressBar from '@/components/ProgressBar.vue';
import healthIcon from '/healthIcon.svg';
import data_country from '@/assets/dataCountry.json';
import { inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();
const count = inject('globalCount');

const prev_countries_visited = ref([]);
const option_country = ref([]);

const errorMessage = ref('');

const healthdeclarationSchema = z.object({
  prev_countries_visited: z.array(z.any())
    .refine(arr => Array.isArray(arr) && arr.length > 0, "Please select at least one option")
});

onMounted(() => {
  option_country.value = data_country.map(c => ({
    name: c.country,
    code: c.symbol
  }));
  count.value = 2;
});

const previousClicked = () => {
  router.push('/new/trip-&-accomodation-information');
};

const onSubmit = (event) => {
  event.preventDefault();
  errorMessage.value = '';

  const formData = {
    prev_countries_visited: prev_countries_visited.value
  };

  try {
    healthdeclarationSchema.parse(formData);
    console.log('Selected countries:', prev_countries_visited.value);
    router.push('/new/success');
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorMessage.value = error.errors[0].message;
      const firstErrorField = document.querySelector('.form-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
};
</script>

<template>
  <header class="app-header">
    Arrival Card &gt; Add Arrival Card
  </header>

  <div class="app-container">
    <div class="page-container">
      <div class="content-wrapper">
        <div class="progress-container">
          <ProgressBar />
        </div>

        <div class="form-section">
          <div class="card-header">
            <img :src="healthIcon" alt="Health icon">
            <h2 class="card-title">Health Declaration</h2>
          </div>
          <hr class="card-divider">

          <div class="health-description">
            <p>
              Passengers travelling to and entering Thailand have to be vaccinated with the vaccines approved by
              Thailand or by the World Health Organization (WHO) or other vaccines as allowed by the Ministry of
              Public Health of Thailand.
            </p>
            <p>
              Please list the name of the countries/territories where you stayed within two weeks before arrival.
            </p>
          </div>

          <form @submit="onSubmit">
            <div class="form-field" :class="{ error: errorMessage }">
              <label class="form-label form-label-required">Countries/Territories Visited (Past 2 weeks)</label>
              <MultiSelect
                v-model="prev_countries_visited"
                :options="option_country"
                optionLabel="name"
                optionValue="code"
                filter
                placeholder="Select Countries"
                :maxSelectedLabels="3"
              />
              <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
            </div>

            <div class="btn-group">
              <button type="button" class="btn btn-secondary" @click="previousClicked()">Previous</button>
              <button type="submit" class="btn btn-primary">Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.form-field.error .p-multiselect {
  border-color: #ef4444;
}
</style>
