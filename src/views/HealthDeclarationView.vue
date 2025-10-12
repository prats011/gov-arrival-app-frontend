<script setup>
import ProgressBar from '@/components/ProgressBar.vue';
import healthIcon from '/healthIcon.svg';
import data_country from '@/assets/dataCountry.json';
import { inject, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import axios from 'axios';

const router = useRouter();
const count = inject('globalCount');

const prev_countries_visited = ref([]);
const option_country = ref([]);
const errorMessage = ref('');
const showErrors = ref(false);
const validationErrors = ref({});

const selected_year_of_arrival = ref('');
const selected_month_of_arrival = ref('');
const selected_day_of_arrival = ref('');
const selected_year_of_departure = ref('');
const selected_month_of_departure = ref('');
const selected_day_of_departure = ref('');
const country_boarded = ref('');
const purpose_of_travel = ref('');
const purpose_of_travel_other = ref('');
const mode_of_travel_arrival = ref('');
const mode_of_transport_arrival = ref('');
const mode_of_transport_arrival_other = ref('');
const flight_vehicle_no_arrival = ref('');
const mode_of_travel_departure = ref('');
const mode_of_transport_departure = ref('');
const mode_of_transport_departure_other = ref('');
const flight_vehicle_no_departure = ref('');
const type_of_accommodation = ref('');
const type_other = ref('');
const province = ref('');
const district_area = ref('');
const sub_district = ref('');
const post_code = ref('');
const address = ref('');

onMounted(() => {
  option_country.value = data_country.map(c => ({ name: c.country, code: c.symbol }));

  const savedTrip = JSON.parse(localStorage.getItem("local_trip_data") || "null");
  if (savedTrip) {
    selected_year_of_arrival.value = savedTrip.date_of_arrival?.year || '';
    selected_month_of_arrival.value = savedTrip.date_of_arrival?.month || '';
    selected_day_of_arrival.value = savedTrip.date_of_arrival?.day || '';
    selected_year_of_departure.value = savedTrip.date_of_departure?.year || '';
    selected_month_of_departure.value = savedTrip.date_of_departure?.month || '';
    selected_day_of_departure.value = savedTrip.date_of_departure?.day || '';
    country_boarded.value = savedTrip.country_boarded || '';
    purpose_of_travel.value = savedTrip.purpose_of_travel || '';
    purpose_of_travel_other.value = savedTrip.purpose_of_travel_other || '';
    mode_of_travel_arrival.value = savedTrip.mode_of_travel_arrival || '';
    mode_of_transport_arrival.value = savedTrip.mode_of_transport_arrival || '';
    mode_of_transport_arrival_other.value = savedTrip.mode_of_transport_arrival_other || '';
    flight_vehicle_no_arrival.value = savedTrip.flight_vehicle_no_arrival || '';
    mode_of_travel_departure.value = savedTrip.mode_of_travel_departure || '';
    mode_of_transport_departure.value = savedTrip.mode_of_transport_departure || '';
    mode_of_transport_departure_other.value = savedTrip.mode_of_transport_departure_other || '';
    flight_vehicle_no_departure.value = savedTrip.flight_vehicle_no_departure || '';
    type_of_accommodation.value = savedTrip.type_of_accommodation || '';
    type_other.value = savedTrip.type_other || '';
    province.value = savedTrip.province || '';
    district_area.value = savedTrip.district_area || '';
    sub_district.value = savedTrip.sub_district || '';
    post_code.value = savedTrip.post_code || '';
    address.value = savedTrip.address || '';
    prev_countries_visited.value = savedTrip.countries_visited || [];
  }

  count.value = 2;
});

const formattedArrivalDate = computed(() => {
  if (selected_year_of_arrival.value && selected_month_of_arrival.value && selected_day_of_arrival.value) {
    return `${selected_year_of_arrival.value}-${selected_month_of_arrival.value.padStart(2,'0')}-${selected_day_of_arrival.value.padStart(2,'0')}`;
  }
  return null;
});

const formattedDepartureDate = computed(() => {
  if (selected_year_of_departure.value && selected_month_of_departure.value && selected_day_of_departure.value) {
    return `${selected_year_of_departure.value}-${selected_month_of_departure.value.padStart(2,'0')}-${selected_day_of_departure.value.padStart(2,'0')}`;
  }
  return null;
});

const tripInfoSchema = z.object({
  date_of_arrival: z.object({
    year: z.string().min(1),
    month: z.string().min(1),
    day: z.string().min(1)
  }),
  date_of_departure: z.object({
    year: z.string().nullable(),
    month: z.string().nullable(),
    day: z.string().nullable()
  }).nullable(),
  country_boarded: z.string().min(1),
  purpose_of_travel: z.string().min(1),
  purpose_of_travel_other: z.string().max(80).nullable(),
  mode_of_travel_arrival: z.string().min(1),
  mode_of_transport_arrival: z.string().min(1),
  mode_of_transport_arrival_other: z.string().max(80).nullable(),
  flight_vehicle_no_arrival: z.string().min(1),
  mode_of_travel_departure: z.string().nullable(),
  mode_of_transport_departure: z.string().nullable(),
  mode_of_transport_departure_other: z.string().max(80).nullable(),
  flight_vehicle_no_departure: z.string().nullable(),
  type_of_accommodation: z.string().min(1),
  type_other: z.string().max(80).nullable(),
  province: z.string().min(1),
  district_area: z.string().min(1),
  sub_district: z.string().min(1),
  post_code: z.string().min(4),
  address: z.string().min(1)
});

const validateAllFields = () => {
  try {
    const departureData = {
      date_of_departure: {
        year: selected_year_of_departure.value || null,
        month: selected_month_of_departure.value || null,
        day: selected_day_of_departure.value || null
      },
      mode_of_travel_departure: mode_of_travel_departure.value || null,
      mode_of_transport_departure: mode_of_transport_departure.value || null,
      mode_of_transport_departure_other: mode_of_transport_departure_other.value || null,
      flight_vehicle_no_departure: flight_vehicle_no_departure.value || null
    };

    tripInfoSchema.parse({
      date_of_arrival: { year: selected_year_of_arrival.value, month: selected_month_of_arrival.value, day: selected_day_of_arrival.value },
      ...departureData,
      country_boarded: country_boarded.value,
      purpose_of_travel: purpose_of_travel.value,
      purpose_of_travel_other: purpose_of_travel_other.value || null,
      mode_of_travel_arrival: mode_of_travel_arrival.value,
      mode_of_transport_arrival: mode_of_transport_arrival.value,
      mode_of_transport_arrival_other: mode_of_transport_arrival_other.value || null,
      flight_vehicle_no_arrival: flight_vehicle_no_arrival.value,
      type_of_accommodation: type_of_accommodation.value,
      type_other: type_other.value || null,
      province: province.value,
      district_area: district_area.value,
      sub_district: sub_district.value,
      post_code: post_code.value,
      address: address.value
    });

    validationErrors.value = {};
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      validationErrors.value = Object.fromEntries(err.errors.map(e => [e.path.join('.'), e.message]));
    }
    return false;
  }
};

const healthSchema = z.object({
  countries_visited: z.array(z.string()).min(1, "Please select at least one country")
});

const onSubmit = async (event) => {
  event.preventDefault();
  showErrors.value = true;

  if (!validateAllFields()) {
    console.log("Trip validation failed:", validationErrors.value);
    return;
  }

  const healthValidation = healthSchema.safeParse({ countries_visited: prev_countries_visited.value });
  if (!healthValidation.success) {
    errorMessage.value = healthValidation.error.errors[0].message;
    return;
  } else {
    errorMessage.value = '';
  }

  const processedData = {
    date_of_arrival: formattedArrivalDate.value,
    date_of_departure: formattedDepartureDate.value || null,
    country_boarded: country_boarded.value,
    purpose_of_travel: purpose_of_travel.value === 'Others' ? purpose_of_travel_other.value : purpose_of_travel.value,
    mode_of_travel_arrival: mode_of_travel_arrival.value,
    mode_of_transport_arrival: mode_of_transport_arrival.value === 'Others' ? mode_of_transport_arrival_other.value : mode_of_transport_arrival.value,
    flight_vehicle_no_arrival: flight_vehicle_no_arrival.value,
    mode_of_travel_departure: mode_of_travel_departure.value || null,
    mode_of_transport_departure: mode_of_transport_departure.value === 'Others' ? mode_of_transport_departure_other.value : mode_of_transport_departure.value || null,
    flight_vehicle_no_departure: flight_vehicle_no_departure.value || null,
    type_of_accommodation: type_of_accommodation.value === 'Others' ? type_other.value : type_of_accommodation.value,
    province: province.value,
    district_area: district_area.value,
    sub_district: sub_district.value,
    post_code: post_code.value,
    address: address.value,
    countries_visited: prev_countries_visited.value
  };

  try {
    const response = await axios.post("/api/health-declaration", processedData);
    if (response.data.success) {
      console.log("Trip saved to server:", response.data.data);
      localStorage.setItem("local_trip_data", JSON.stringify(processedData));
      router.push("/next-page");
    } else {
      validationErrors.value = response.data.errors || {};
    }
  } catch (err) {
    console.error("Failed to save trip data:", err.response?.data || err.message);
    alert("Server error. Could not save data.");
  }
};

const previousClicked = () => router.push('/new/trip-&-accomodation-information');
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
              <MultiSelect v-model="prev_countries_visited" :options="option_country" optionLabel="name"
                optionValue="code" filter placeholder="Select Countries" :maxSelectedLabels="3" />
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
