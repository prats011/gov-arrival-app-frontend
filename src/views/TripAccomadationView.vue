<script setup>
import { inject, ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import ProgressBar from '@/components/ProgressBar.vue';
import data_country from '@/assets/dataCountry.json';
import data_months from '@/assets/dataDate.json';
import tripIcon from '/worldIcon.svg';
import buildingIcon from '/buildingIcon.svg';

const option_month = ref([]);
const option_day = ref([]);
const option_year = ref([]);
const option_country = ref([]);

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

const validationErrors = ref({});
const showErrors = ref(false);
const localTripData = ref(null);

const router = useRouter();
const count = inject('globalCount', ref(0));

const textInputSchema = z.string()
  .trim()
  .min(1, "This field is required")
  .max(80, "Maximum 80 characters allowed")
  .regex(/^[\p{L}\s]+$/u, "Only letters and spaces are allowed");

const dropdownSchema = z.any().refine(val => val, "Please select an option");

const dateSchema = z.object({
  year: z.string().min(1, "Year is required"),
  month: z.string().min(1, "Month is required"),
  day: z.string().min(1, "Day is required")
}).refine(d => {
  const date = new Date(d.year, d.month - 1, d.day);
  return date.getFullYear() === +d.year &&
    date.getMonth() === +d.month - 1 &&
    date.getDate() === +d.day;
}, "Please enter a valid date");

const optionalDateSchema = z.object({
  year: z.string().nullable(),
  month: z.string().nullable(),
  day: z.string().nullable()
}).refine(d => {
  if (!d.year && !d.month && !d.day) return true;
  const date = new Date(d.year, d.month - 1, d.day);
  return date.getFullYear() === +d.year &&
    date.getMonth() === +d.month - 1 &&
    date.getDate() === +d.day;
}, "Please enter a valid date");

const flightNoSchema = z.string()
  .trim()
  .max(80, "Maximum 80 characters allowed")
  .regex(/^[A-Za-z0-9]*$/, "Only letters and numbers are allowed")
  .nullable();

const addressSchema = z.string()
  .min(1, "Address cannot be empty")
  .max(300, "Address must be at most 300 characters")
  .regex(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u, "Invalid characters in address");

const tripInfoSchema = z.object({
  date_of_arrival: dateSchema,
  date_of_departure: optionalDateSchema.nullable(),
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

const formattedArrivalDate = computed(() => {
  if (selected_year_of_arrival.value && selected_month_of_arrival.value && selected_day_of_arrival.value) {
    return [selected_year_of_arrival.value, selected_month_of_arrival.value, selected_day_of_arrival.value]
      .map(v => String(v).padStart(2, '0'))
      .join('-');
  }
  return null;
});

const formattedDepartureDate = computed(() => {
  if (selected_year_of_departure.value && selected_month_of_departure.value && selected_day_of_departure.value) {
    return [selected_year_of_departure.value, selected_month_of_departure.value, selected_day_of_departure.value]
      .map(v => String(v).padStart(2, '0'))
      .join('-');
  }
  return null;
});

const validateField = (fieldName, value = null) => {
  try {
    let schema;
    switch (fieldName) {
      case 'date_of_arrival':
        schema = dateSchema;
        value = { year: selected_year_of_arrival.value, month: selected_month_of_arrival.value, day: selected_day_of_arrival.value };
        break;
      case 'date_of_departure':
        if (!selected_year_of_departure.value && !selected_month_of_departure.value && !selected_day_of_departure.value) return;
        schema = optionalDateSchema;
        value = { year: selected_year_of_departure.value, month: selected_month_of_departure.value, day: selected_day_of_departure.value };
        break;
      case 'flight_vehicle_no_arrival': schema = flightNoSchema; break;
      case 'flight_vehicle_no_departure':
        if (!flight_vehicle_no_departure.value) return;
        schema = flightNoSchema; break;
      case 'province': case 'district_area': case 'sub_district': schema = textInputSchema; break;
      case 'country_boarded': case 'purpose_of_travel': case 'mode_of_travel_arrival':
      case 'mode_of_transport_arrival': case 'mode_of_travel_departure':
      case 'mode_of_transport_departure': case 'type_of_accommodation':
        schema = dropdownSchema; break;
      case 'post_code': schema = z.string().min(4).max(6).regex(/^[0-9]+$/, "Numbers only"); break;
      case 'address': schema = addressSchema; break;
      default:
        if (tripInfoSchema.shape[fieldName]) schema = tripInfoSchema.shape[fieldName];
        else return;
    }
    schema.parse(value);
    delete validationErrors.value[fieldName];
  } catch (err) {
    if (err instanceof z.ZodError) validationErrors.value[fieldName] = err.errors[0].message;
  }
};

const validateAllFields = () => {
  try {
    const dataToValidate = {
      date_of_arrival: { year: selected_year_of_arrival.value, month: selected_month_of_arrival.value, day: selected_day_of_arrival.value },
      country_boarded: country_boarded.value,
      purpose_of_travel: purpose_of_travel.value,
      purpose_of_travel_other: purpose_of_travel_other.value,
      mode_of_travel_arrival: mode_of_travel_arrival.value,
      mode_of_transport_arrival: mode_of_transport_arrival.value,
      mode_of_transport_arrival_other: mode_of_transport_arrival_other.value,
      flight_vehicle_no_arrival: flight_vehicle_no_arrival.value,
      type_of_accommodation: type_of_accommodation.value,
      type_other: type_other.value,
      province: province.value,
      district_area: district_area.value,
      sub_district: sub_district.value,
      post_code: String(post_code.value),
      address: address.value
    };

    const hasDepartureData = selected_year_of_departure.value ||
      selected_month_of_departure.value ||
      selected_day_of_departure.value ||
      mode_of_travel_departure.value ||
      mode_of_transport_departure.value ||
      flight_vehicle_no_departure.value;

    if (hasDepartureData) {
      dataToValidate.date_of_departure = {
        year: selected_year_of_departure.value,
        month: selected_month_of_departure.value,
        day: selected_day_of_departure.value
      };
      dataToValidate.mode_of_travel_departure = mode_of_travel_departure.value;
      dataToValidate.mode_of_transport_departure = mode_of_transport_departure.value;
      dataToValidate.mode_of_transport_departure_other = mode_of_transport_departure_other.value;
      dataToValidate.flight_vehicle_no_departure = flight_vehicle_no_departure.value;
    }

    tripInfoSchema.parse(dataToValidate);
    validationErrors.value = {};
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      validationErrors.value = Object.fromEntries(err.errors.map(e => [e.path.join('.'), e.message]));
    }
    return false;
  }
};

const watchField = (field, extraHandler) => watch(field, (v) => {
  extraHandler?.(v);
  validateField(field.key || field, v);
});

watchField(country_boarded);
watchField(purpose_of_travel, v => { if (v !== 'Others') purpose_of_travel_other.value = ''; });
watchField(purpose_of_travel_other, v => { if (purpose_of_travel.value === 'Others') validateField('purpose_of_travel_other', v); });
watchField(mode_of_travel_arrival);
watchField(mode_of_transport_arrival, v => { if (v !== 'Others') mode_of_transport_arrival_other.value = ''; });
watchField(mode_of_transport_arrival_other, v => { if (mode_of_transport_arrival.value === 'Others') validateField('mode_of_transport_arrival_other', v); });
watchField(flight_vehicle_no_arrival);
watchField(mode_of_travel_departure);
watchField(mode_of_transport_departure, v => { if (v !== 'Others') mode_of_transport_departure_other.value = ''; });
watchField(mode_of_transport_departure_other, v => { if (mode_of_transport_departure.value === 'Others') validateField('mode_of_transport_departure_other', v); });
watchField(flight_vehicle_no_departure);
watchField(type_of_accommodation, v => { if (v !== 'Others') type_other.value = ''; });
watchField(type_other, v => { if (type_of_accommodation.value === 'Others') validateField('type_other', v); });
watchField(province); watchField(district_area); watchField(sub_district);
watchField(post_code, v => validateField('post_code', String(v)));
watchField(address);

onMounted(() => {
  option_month.value = data_months.months;
  option_day.value = data_months.days;
  option_year.value = data_months.years;
  option_country.value = data_country.map(c => ({
    country: `${c.symbol}: ${c.country}`,
    symbol: c.symbol, cities: c.cities
  }));
  count.value = 1;
});

const onSubmit = (event) => {
  event.preventDefault();
  if (!validateAllFields()) {
    showErrors.value = true;
    return;
  }

  localTripData.value = {
    date_of_arrival: formattedArrivalDate.value,
    date_of_departure: formattedDepartureDate.value,
    country_boarded: country_boarded.value,
    purpose_of_travel: purpose_of_travel.value === 'Others' ? purpose_of_travel_other.value : purpose_of_travel.value,
    mode_of_travel_arrival: mode_of_travel_arrival.value,
    mode_of_transport_arrival: mode_of_transport_arrival.value === 'Others' ? mode_of_transport_arrival_other.value : mode_of_transport_arrival.value,
    flight_vehicle_no_arrival: flight_vehicle_no_arrival.value,
    mode_of_travel_departure: mode_of_travel_departure.value,
    mode_of_transport_departure: mode_of_transport_departure.value === 'Others' ? mode_of_transport_departure_other.value : mode_of_transport_departure.value,
    flight_vehicle_no_departure: flight_vehicle_no_departure.value,
    type_of_accommodation: type_of_accommodation.value === 'Others' ? type_other.value : type_of_accommodation.value,
    province: province.value,
    district_area: district_area.value,
    sub_district: sub_district.value,
    post_code: post_code.value,
    address: address.value
  };

  console.log("Trip saved locally:", localTripData.value);
  router.push('/new/health-declaration');
};

const getErrorMessage = fieldName => validationErrors.value[fieldName] || '';
const hasError = fieldName => showErrors.value && !!validationErrors.value[fieldName];
const previousClicked = () => router.push('/new/personal-information');

const getTransportOptions = (travelMode) => {
  return {
    AIR: ['Commercial Flight', 'Private/Cargo Airline', 'Others'],
    LAND: ['Car', 'Train', 'Others'],
    SEA: ['Cruise', 'Commercial Vessel', 'Others']
  }[travelMode] || ['Select'];
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

        <form @submit="onSubmit">
          <div class="form-section">
            <div class="card-header">
              <img :src="tripIcon" alt="Trip icon" />
              <h2 class="card-title">Trip Information</h2>
            </div>
            <hr class="card-divider" />

            <div class="form-section-title">Arrival Information</div>

            <div class="form-grid">
              <div class="form-field" :class="{ error: hasError('date_of_arrival') }">
                <label class="form-label form-label-required">Date of Arrival</label>
                <div class="date-inputs">
                  <select v-model="selected_year_of_arrival" class="form-select"
                    :class="{ error: hasError('date_of_arrival') }">
                    <option disabled value="">yyyy</option>
                    <option v-for="opt in option_year" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_month_of_arrival" class="form-select"
                    :class="{ error: hasError('date_of_arrival') }">
                    <option disabled value="">mm</option>
                    <option v-for="opt in option_month" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_day_of_arrival" class="form-select"
                    :class="{ error: hasError('date_of_arrival') }">
                    <option disabled value="">dd</option>
                    <option v-for="opt in option_day" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                </div>
                <span v-if="hasError('date_of_arrival')" class="error-message">{{ getErrorMessage('date_of_arrival')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('country_boarded') }">
                <label class="form-label form-label-required">Country/Territory where you Boarded</label>
                <PSelect v-model="country_boarded" :options="option_country" optionLabel="country"
                  placeholder="Select a Country" :filter="true" filterBy="country"
                  :class="{ error: hasError('country_boarded') }" />
                <span v-if="hasError('country_boarded')" class="error-message">
                  {{ getErrorMessage('country_boarded') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('purpose_of_travel') }">
                <label class="form-label form-label-required">Purpose of Travel</label>
                <select v-model="purpose_of_travel" class="form-select"
                  :class="{ error: hasError('purpose_of_travel') }">
                  <option disabled value="">Select purpose</option>
                  <option>Holiday</option>
                  <option>Meeting</option>
                  <option>Sports</option>
                  <option>Business</option>
                  <option>Incentive</option>
                  <option>Medical &amp; Wellness</option>
                  <option>Convention</option>
                  <option>Employment</option>
                  <option>Exhibition</option>
                  <option>Education</option>
                  <option>Others</option>
                </select>
                <input type="text" v-model="purpose_of_travel_other" class="form-input" placeholder="Please specify"
                  :disabled="purpose_of_travel !== 'Others'" />
                <span v-if="hasError('purpose_of_travel')" class="error-message">{{ getErrorMessage('purpose_of_travel')
                }}</span>
                <span v-if="hasError('purpose_of_travel_other')" class="error-message">{{
                  getErrorMessage('purpose_of_travel_other')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_travel_arrival') }">
                <label class="form-label form-label-required">Mode of Travel</label>
                <div class="radio-group">
                  <div class="radio-item">
                    <input type="radio" value="AIR" v-model="mode_of_travel_arrival" />
                    <label>AIR</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="LAND" v-model="mode_of_travel_arrival" />
                    <label>LAND</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="SEA" v-model="mode_of_travel_arrival" />
                    <label>SEA</label>
                  </div>
                </div>
                <span v-if="hasError('mode_of_travel_arrival')" class="error-message">{{
                  getErrorMessage('mode_of_travel_arrival')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_transport_arrival') }">
                <label class="form-label form-label-required">Mode of Transport</label>
                <div class="form-input-group">
                  <select v-model="mode_of_transport_arrival" class="form-select"
                    :class="{ error: hasError('mode_of_transport_arrival') }">
                    <option disabled value="">Select</option>
                    <option v-for="opt in getTransportOptions(mode_of_travel_arrival)" :key="opt" :value="opt"
                      v-show="opt !== 'Select'">{{ opt }}</option>
                  </select>
                  <input type="text" v-model="mode_of_transport_arrival_other" class="form-input"
                    placeholder="Please specify" :disabled="mode_of_transport_arrival !== 'Others'" />
                </div>
                <span v-if="hasError('mode_of_transport_arrival')" class="error-message">{{
                  getErrorMessage('mode_of_transport_arrival')
                }}</span>
                <span v-if="hasError('mode_of_transport_arrival_other')" class="error-message">{{
                  getErrorMessage('mode_of_transport_arrival_other') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('flight_vehicle_no_arrival') }">
                <label class="form-label form-label-required">Flight No./Vehicle No.</label>
                <input type="text" v-model="flight_vehicle_no_arrival" class="form-input" />
                <span v-if="hasError('flight_vehicle_no_arrival')" class="error-message">{{
                  getErrorMessage('flight_vehicle_no_arrival') }}</span>
              </div>
            </div>

            <div class="form-section-title">Departure Information</div>

            <div class="form-grid">
              <div class="form-field" :class="{ error: hasError('date_of_departure') }">
                <label class="form-label">Date of Departure</label>
                <div class="date-inputs">
                  <select v-model="selected_year_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') && (selected_year_of_departure || selected_month_of_departure || selected_day_of_departure) }">
                    <option disabled value="">yyyy</option>
                    <option v-for="opt in option_year" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_month_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') && (selected_year_of_departure || selected_month_of_departure || selected_day_of_departure) }">
                    <option disabled value="">mm</option>
                    <option v-for="opt in option_month" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_day_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') && (selected_year_of_departure || selected_month_of_departure || selected_day_of_departure) }">
                    <option disabled value="">dd</option>
                    <option v-for="opt in option_day" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                </div>
                <span
                  v-if="hasError('date_of_departure') && (selected_year_of_departure || selected_month_of_departure || selected_day_of_departure)"
                  class="error-message">{{ getErrorMessage('date_of_departure') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_travel_departure') }">
                <label class="form-label">Mode of Travel</label>
                <div class="radio-group">
                  <div class="radio-item">
                    <input type="radio" value="AIR" v-model="mode_of_travel_departure" />
                    <label>AIR</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="LAND" v-model="mode_of_travel_departure" />
                    <label>LAND</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="SEA" v-model="mode_of_travel_departure" />
                    <label>SEA</label>
                  </div>
                </div>
                <span v-if="hasError('mode_of_travel_departure') && mode_of_travel_departure" class="error-message">{{
                  getErrorMessage('mode_of_travel_departure') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_transport_departure') }">
                <label class="form-label">Mode of Transport</label>
                <div class="form-input-group">
                  <select v-model="mode_of_transport_departure" class="form-select"
                    :class="{ error: hasError('mode_of_transport_departure') && mode_of_transport_departure }">
                    <option disabled value="">Select</option>
                    <option v-for="opt in getTransportOptions(mode_of_travel_departure)" :key="opt" :value="opt"
                      v-show="opt !== 'Select'">{{ opt }}</option>
                  </select>
                  <input type="text" v-model="mode_of_transport_departure_other" class="form-input"
                    placeholder="Please specify" :disabled="mode_of_transport_departure !== 'Others'" />
                </div>
                <span v-if="hasError('mode_of_transport_departure') && mode_of_transport_departure"
                  class="error-message">{{ getErrorMessage('mode_of_transport_departure') }}</span>
                <span v-if="hasError('mode_of_transport_departure_other') && mode_of_transport_departure_other"
                  class="error-message">{{ getErrorMessage('mode_of_transport_departure_other') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('flight_vehicle_no_departure') }">
                <label class="form-label">Flight No./Vehicle No.</label>
                <input type="text" v-model="flight_vehicle_no_departure" class="form-input" />
                <span v-if="hasError('flight_vehicle_no_departure') && flight_vehicle_no_departure"
                  class="error-message">{{ getErrorMessage('flight_vehicle_no_departure') }}</span>
              </div>
            </div>

            <div class="form-section">
              <div class="card-header">
                <img :src="buildingIcon" alt="Building icon" />
                <h2 class="card-title">Accommodation Information</h2>
              </div>
              <hr class="card-divider" />

              <div class="form-grid">
                <div class="form-field" :class="{ error: hasError('type_of_accommodation') }">
                  <label class="form-label form-label-required">Type of Accommodation in Thailand</label>
                  <select v-model="type_of_accommodation" class="form-select"
                    :class="{ error: hasError('type_of_accommodation') }">
                    <option disabled value="">Select type</option>
                    <option>Hotels</option>
                    <option>Resorts</option>
                    <option>Motels</option>
                    <option>Hostels</option>
                    <option>Others</option>
                  </select>
                  <input type="text" v-model="type_other" class="form-input" placeholder="Please specify"
                    :disabled="type_of_accommodation !== 'Others'" />
                  <span v-if="hasError('type_of_accommodation')" class="error-message">{{
                    getErrorMessage('type_of_accommodation') }}</span>
                  <span v-if="hasError('type_other')" class="error-message">{{ getErrorMessage('type_other') }}</span>
                </div>

                <div class="form-field" :class="{ error: hasError('province') }">
                  <label class="form-label form-label-required">Province</label>
                  <input type="text" v-model="province" class="form-input" />
                  <span v-if="hasError('province')" class="error-message">{{ getErrorMessage('province') }}</span>
                </div>

                <div class="form-field" :class="{ error: hasError('district_area') }">
                  <label class="form-label form-label-required">District/ Area</label>
                  <input type="text" v-model="district_area" class="form-input" />
                  <span v-if="hasError('district_area')" class="error-message">{{ getErrorMessage('district_area')
                    }}</span>
                </div>

                <div class="form-field" :class="{ error: hasError('sub_district') }">
                  <label class="form-label form-label-required">Sub-district / Sub-Area</label>
                  <input type="text" v-model="sub_district" class="form-input" />
                  <span v-if="hasError('sub_district')" class="error-message">{{ getErrorMessage('sub_district')
                    }}</span>
                </div>

                <div class="form-field" :class="{ error: hasError('post_code') }">
                  <label class="form-label form-label-required">Post Code</label>
                  <input type="text" v-model="post_code" class="form-input" />
                  <span v-if="hasError('post_code')" class="error-message">{{ getErrorMessage('post_code') }}</span>
                </div>

                <div class="form-field" :class="{ error: hasError('address') }">
                  <label class="form-label form-label-required">Address</label>
                  <textarea v-model="address" class="form-textarea" placeholder="Add Address Here"></textarea>
                  <span v-if="hasError('address')" class="error-message">{{ getErrorMessage('address') }}</span>
                </div>
              </div>
            </div>

            <div class="btn-group">
              <button type="button" class="btn btn-secondary" @click="previousClicked()">Previous</button>
              <button type="submit" class="btn btn-primary">Continue</button>
            </div>
          </div>
        </form>
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

.form-field.error .form-input,
.form-field.error .form-select,
.form-field.error .form-textarea {
  border-color: #ef4444;
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
}
</style>
