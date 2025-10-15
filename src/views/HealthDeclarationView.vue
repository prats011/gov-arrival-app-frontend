<script setup>
import ProgressBar from "@/components/ProgressBar.vue";
import healthIcon from "/healthIcon.svg";
import data_country from "@/assets/dataCountry.json";
import { inject, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import axios from "axios";

const router = useRouter();
const count = inject("globalCount");

const countries_visited = ref([]);
const option_country = ref([]);
const showErrors = ref(false);
const validationErrors = ref({});

onMounted(() => {
  option_country.value = data_country.map((c) => ({
    name: c.country,
    code: c.symbol,
  }));
 
  count.value = 2;
});

watch(countries_visited, () => validateHealth());

const healthSchema = z.object({
  countries_visited: z.array(z.string()).min(1, "Please select at least one country"),
});

const validateHealth = () => {
  try {
    healthSchema.parse({ countries_visited: countries_visited.value });
    validationErrors.value = {};
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      validationErrors.value = Object.fromEntries(err.errors.map(e => [e.path.join('.'), e.message]));
    }
    return false;
  }
};

const onSubmit = async (event) => {
  event.preventDefault();

  if (!validateHealth()) {
    showErrors.value = true;
    return;
  }

  const personalInfo = JSON.parse(sessionStorage.getItem('personalInfo') || '{}');
  const tripInfo = JSON.parse(sessionStorage.getItem('tripInfo') || '{}');

  const healthData = {
    countries_visited: countries_visited.value,
  };

  const payload = {
    personalInfo,
    tripInfo,
    health: healthData,
  };

  console.log("Sending data:", payload);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/create`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const result = response.data;

    if (result.success) {
      console.log('Entry form submitted successfully!', result);
      sessionStorage.clear();
      router.push("/new/success");
    } else {
      console.error('Submission error:', result.errors);
    }
  } catch (error) {
    console.error('Network or server error:', error);
  }
};


const previousClicked = () => router.push("/new/trip-&-accomodation-information");
</script>

<template>
  <header class="app-header">Arrival Card &gt; Add Arrival Card</header>

  <div class="app-container">
    <div class="page-container">
      <div class="content-wrapper">
        <div class="progress-container">
          <ProgressBar />
        </div>

        <div class="form-section">
          <div class="card-header">
            <img :src="healthIcon" alt="Health icon" />
            <h2 class="card-title">Health Declaration</h2>
          </div>
          <hr class="card-divider" />

          <div class="health-description">
            <p>
              Passengers travelling to and entering Thailand have to be vaccinated with
              the vaccines approved by Thailand or by the World Health Organization (WHO)
              or other vaccines as allowed by the Ministry of Public Health of Thailand.
            </p>
            <p>
              Please list the countries/territories where you stayed within two weeks
              before arrival.
            </p>
          </div>

          <form @submit.prevent="onSubmit">
            <div class="form-field" :class="{ error: validationErrors.countries_visited }">
              <label class="form-label form-label-required">Countries/Territories Visited (Past 2 weeks)</label>
              <MultiSelect v-model="countries_visited" :options="option_country" optionLabel="name" optionValue="name"
                filter placeholder="Select at least one country" :maxSelectedLabels="3" />
              <span v-if="validationErrors.countries_visited" class="error-message">
                {{ validationErrors.countries_visited }}
              </span>
            </div>

            <div class="btn-group">
              <button type="button" class="btn btn-secondary" @click="previousClicked">
                Previous
              </button>
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
