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

const selected_year_of_arrival = ref('');
const selected_month_of_arrival = ref('');
const selected_day_of_arrival = ref('');

const selected_year_of_departure = ref('');
const selected_month_of_departure = ref('');
const selected_day_of_departure = ref('');

const selected_country = ref('');
const purpose_of_travel = ref('');
const purpose_other = ref('');
const mode_of_travel = ref('');
const mode_of_transport = ref('');
const mode_of_transport_other = ref('');
const flight_no = ref('');
const dep_mode_of_travel = ref('');
const dep_mode_of_transport = ref('');
const dep_mode_of_transport_other = ref('');
const dep_flight_no = ref('');

const type_of_accommodation = ref('');
const type_other = ref('');
const province = ref('');
const district = ref('');
const sub_district = ref('');
const post_code = ref('');
const address = ref('');

const option_country = ref([]);
const router = useRouter();
const count = inject('globalCount', ref(0));

const validationErrors = ref({});
const showErrors = ref(false);

const textInputSchema = z.string()
  .trim()
  .min(1, "This field is required")
  .max(80, "Maximum 80 characters allowed")
  .refine(val => val.trim().length > 0, "Field cannot be only spaces")
  .refine(val => !/[0-9]/.test(val), "Numbers are not allowed")
  .refine(val => /^[\p{L}\s]+$/u.test(val), "Only letters and spaces are allowed");

const dropdownSchema = z.any().refine(val => val !== '' && val !== null && val !== undefined, "Please select an option");

const dateSchema = z.object({
  year: z.string().min(1, "Year is required"),
  month: z.string().min(1, "Month is required"),
  day: z.string().min(1, "Day is required")
}).refine(data => {
  const year = parseInt(data.year);
  const month = parseInt(data.month);
  const day = parseInt(data.day);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}, "Please enter a valid date");


const addressSchema = z.string()
  .min(1, "Address cannot be empty")
  .max(300, "Address must be at most 300 characters")
  .regex(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u, "Invalid characters in address");

const tripInfoSchema = z.object({
  date_of_arrival: dateSchema,
  selected_country: dropdownSchema,
  purpose_of_travel: dropdownSchema,
  purpose_other: z.string().max(80).optional().or(z.literal('')),
  mode_of_travel: dropdownSchema,
  mode_of_transport: dropdownSchema,
  mode_of_transport_other: z.string().max(80).optional().or(z.literal('')),
  flight_no: textInputSchema,
  date_of_departure: dateSchema,
  dep_mode_of_travel: dropdownSchema,
  dep_mode_of_transport: dropdownSchema,
  dep_mode_of_transport_other: z.string().max(80).optional().or(z.literal('')),
  dep_flight_no: textInputSchema,
  type_of_accommodation: dropdownSchema,
  type_other: z.string().max(80).optional().or(z.literal('')),
  province: textInputSchema,
  district: textInputSchema,
  sub_district: textInputSchema,
  post_code: z.string()
    .min(4, "Post code must be at least 4 digits")
    .max(6, "Post code too long")
    .regex(/^[0-9]+$/, "Numbers only"),
  address: addressSchema
});

const formattedArrivalDate = computed(() => {
  if (selected_year_of_arrival.value && selected_month_of_arrival.value && selected_day_of_arrival.value) {
    const y = String(selected_year_of_arrival.value).padStart(4, '0');
    const m = String(selected_month_of_arrival.value).padStart(2, '0');
    const d = String(selected_day_of_arrival.value).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
});

const formattedDepartureDate = computed(() => {
  if (selected_year_of_departure.value && selected_month_of_departure.value && selected_day_of_departure.value) {
    const y = String(selected_year_of_departure.value).padStart(4, '0');
    const m = String(selected_month_of_departure.value).padStart(2, '0');
    const d = String(selected_day_of_departure.value).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
});

const validateField = (fieldName, value) => {
  try {
    let schema;
    switch (fieldName) {
      case 'date_of_arrival':
        schema = dateSchema;
        value = {
          year: selected_year_of_arrival.value,
          month: selected_month_of_arrival.value,
          day: selected_day_of_arrival.value
        };
        break;
      case 'date_of_departure':
        schema = dateSchema;
        value = {
          year: selected_year_of_departure.value,
          month: selected_month_of_departure.value,
          day: selected_day_of_departure.value
        };
        break;
      case 'flight_no':
      case 'dep_flight_no':
      case 'province':
      case 'district':
      case 'sub_district':
        schema = textInputSchema;
        break;
      case 'selected_country':
      case 'purpose_of_travel':
      case 'mode_of_travel':
      case 'mode_of_transport':
      case 'dep_mode_of_travel':
      case 'dep_mode_of_transport':
      case 'type_of_accommodation':
        schema = dropdownSchema;
        break;
      case 'post_code':
        schema = z.string()
          .min(4, "Post code must be at least 4 digits")
          .max(6, "Post code too long")
          .regex(/^[0-9]+$/, "Numbers only");
        break;
      case 'address':
        schema = addressSchema;
        break;
      default:
        if (tripInfoSchema.shape[fieldName]) {
          schema = tripInfoSchema.shape[fieldName];
        } else {
          return;
        }
    }
    schema.parse(value);
    delete validationErrors.value[fieldName];
  } catch (error) {
    if (error instanceof z.ZodError) {
      validationErrors.value[fieldName] = error.errors[0].message;
    }
  }
};

const validateAllFields = () => {
  const formData = {
    date_of_arrival: {
      year: selected_year_of_arrival.value,
      month: selected_month_of_arrival.value,
      day: selected_day_of_arrival.value
    },
    selected_country: selected_country.value,
    purpose_of_travel: purpose_of_travel.value,
    purpose_other: purpose_other.value,
    mode_of_travel: mode_of_travel.value,
    mode_of_transport: mode_of_transport.value,
    mode_of_transport_other: mode_of_transport_other.value,
    flight_no: flight_no.value,
    date_of_departure: {
      year: selected_year_of_departure.value,
      month: selected_month_of_departure.value,
      day: selected_day_of_departure.value
    },
    dep_mode_of_travel: dep_mode_of_travel.value,
    dep_mode_of_transport: dep_mode_of_transport.value,
    dep_mode_of_transport_other: dep_mode_of_transport_other.value,
    dep_flight_no: dep_flight_no.value,
    type_of_accommodation: type_of_accommodation.value,
    type_other: type_other.value,
    province: province.value,
    district: district.value,
    sub_district: sub_district.value,
    post_code: String(post_code.value),
    address: address.value
  };

  try {
    tripInfoSchema.parse(formData);
    validationErrors.value = {};
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      validationErrors.value = errors;
    }
    return false;
  }
};

const getErrorMessage = (fieldName) => validationErrors.value[fieldName] || '';
const hasError = (fieldName) => showErrors.value && !!validationErrors.value[fieldName];

watch([selected_year_of_arrival, selected_month_of_arrival, selected_day_of_arrival], () => validateField('date_of_arrival', null));
watch([selected_year_of_departure, selected_month_of_departure, selected_day_of_departure], () => validateField('date_of_departure', null));
watch(selected_country, (v) => validateField('selected_country', v));
watch(purpose_of_travel, (v) => {
  validateField('purpose_of_travel', v);
  if (v !== 'Others') {
    purpose_other.value = '';
    delete validationErrors.value['purpose_other'];
  }
});
watch(purpose_other, (v) => {
  if (purpose_of_travel.value === 'Others') validateField('purpose_other', v);
});
watch(mode_of_travel, (v) => validateField('mode_of_travel', v));
watch(mode_of_transport, (v) => {
  validateField('mode_of_transport', v);
  if (v !== 'Others') {
    mode_of_transport_other.value = '';
    delete validationErrors.value['mode_of_transport_other'];
  }
});
watch(mode_of_transport_other, (v) => {
  if (mode_of_transport.value === 'Others') validateField('mode_of_transport_other', v);
});
watch(flight_no, (v) => validateField('flight_no', v));
watch(dep_mode_of_travel, (v) => validateField('dep_mode_of_travel', v));
watch(dep_mode_of_transport, (v) => {
  validateField('dep_mode_of_transport', v);
  if (v !== 'Others') {
    dep_mode_of_transport_other.value = '';
    delete validationErrors.value['dep_mode_of_transport_other'];
  }
});
watch(dep_mode_of_transport_other, (v) => {
  if (dep_mode_of_transport.value === 'Others') validateField('dep_mode_of_transport_other', v);
});
watch(dep_flight_no, (v) => validateField('dep_flight_no', v));
watch(type_of_accommodation, (v) => {
  validateField('type_of_accommodation', v);
  if (v !== 'Others') {
    type_other.value = '';
    delete validationErrors.value['type_other'];
  }
});
watch(type_other, (v) => {
  if (type_of_accommodation.value === 'Others') validateField('type_other', v);
});
watch(province, (v) => validateField('province', v));
watch(district, (v) => validateField('district', v));
watch(sub_district, (v) => validateField('sub_district', v));
watch(post_code, (v) => validateField('post_code', String(v)));
watch(address, (v) => validateField('address', v));

onMounted(() => {
  option_month.value = data_months.months;
  option_day.value = data_months.days;
  option_year.value = data_months.years;
  option_country.value = data_country.map(c => ({
    country: `${c.symbol}: ${c.country}`,
    symbol: c.symbol,
    cities: c.cities
  }));
  count.value = 1;
});

const onSubmit = (event) => {
  event.preventDefault();
  showErrors.value = true;
  if (!validateAllFields()) {
    const firstErrorField = document.querySelector('.form-field.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  router.push('/new/health-declaration');
};

const previousClicked = () => router.push('/new/personal-information');

const getTransportOptions = (travelMode) => {
  switch (travelMode) {
    case 'AIR': return ['Commercial Flight', 'Private/Cargo Airline', 'Others'];
    case 'LAND': return ['Car', 'Train', 'Others'];
    case 'SEA': return ['Cruise', 'Commercial Vessel', 'Others'];
    default: return ['Select'];
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

              <div class="form-field" :class="{ error: hasError('selected_country') }">
                <label class="form-label form-label-required">Country/Territory where you Boarded</label>
                <select v-model="selected_country" class="form-select" :class="{ error: hasError('selected_country') }">
                  <option disabled value="">Select a Country</option>
                  <option v-for="c in option_country" :key="c.symbol" :value="c.country">{{ c.country }}</option>
                </select>
                <span v-if="hasError('selected_country')" class="error-message">{{ getErrorMessage('selected_country')
                }}</span>
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
                <input type="text" v-model="purpose_other" class="form-input" placeholder="Please specify"
                  :disabled="purpose_of_travel !== 'Others'" />
                <span v-if="hasError('purpose_of_travel')" class="error-message">{{ getErrorMessage('purpose_of_travel')
                }}</span>
                <span v-if="hasError('purpose_other')" class="error-message">{{ getErrorMessage('purpose_other')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_travel') }">
                <label class="form-label form-label-required">Mode of Travel</label>
                <div class="radio-group">
                  <div class="radio-item">
                    <input type="radio" value="AIR" v-model="mode_of_travel" />
                    <label>AIR</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="LAND" v-model="mode_of_travel" />
                    <label>LAND</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="SEA" v-model="mode_of_travel" />
                    <label>SEA</label>
                  </div>
                </div>
                <span v-if="hasError('mode_of_travel')" class="error-message">{{ getErrorMessage('mode_of_travel')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('mode_of_transport') }">
                <label class="form-label form-label-required">Mode of Transport</label>
                <div class="form-input-group">
                  <select v-model="mode_of_transport" class="form-select"
                    :class="{ error: hasError('mode_of_transport') }">
                    <option disabled value="">Select</option>
                    <option v-for="opt in getTransportOptions(mode_of_travel)" :key="opt" :value="opt"
                      v-show="opt !== 'Select'">{{ opt }}</option>
                  </select>
                  <input type="text" v-model="mode_of_transport_other" class="form-input" placeholder="Please specify"
                    :disabled="mode_of_transport !== 'Others'" />
                </div>
                <span v-if="hasError('mode_of_transport')" class="error-message">{{ getErrorMessage('mode_of_transport')
                }}</span>
                <span v-if="hasError('mode_of_transport_other')" class="error-message">{{
                  getErrorMessage('mode_of_transport_other') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('flight_no') }">
                <label class="form-label form-label-required">Flight No./Vehicle No.</label>
                <input type="text" v-model="flight_no" class="form-input" />
                <span v-if="hasError('flight_no')" class="error-message">{{ getErrorMessage('flight_no') }}</span>
              </div>
            </div>

            <div class="form-section-title">Departure Information</div>

            <div class="form-grid">
              <div class="form-field" :class="{ error: hasError('date_of_departure') }">
                <label class="form-label form-label-required">Date of Departure</label>
                <div class="date-inputs">
                  <select v-model="selected_year_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') }">
                    <option disabled value="">yyyy</option>
                    <option v-for="opt in option_year" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_month_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') }">
                    <option disabled value="">mm</option>
                    <option v-for="opt in option_month" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                  <select v-model="selected_day_of_departure" class="form-select"
                    :class="{ error: hasError('date_of_departure') }">
                    <option disabled value="">dd</option>
                    <option v-for="opt in option_day" :key="opt.value" :value="String(opt.value)">{{ opt.name }}
                    </option>
                  </select>
                </div>
                <span v-if="hasError('date_of_departure')" class="error-message">{{ getErrorMessage('date_of_departure')
                }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('dep_mode_of_travel') }">
                <label class="form-label form-label-required">Mode of Travel</label>
                <div class="radio-group">
                  <div class="radio-item">
                    <input type="radio" value="AIR" v-model="dep_mode_of_travel" />
                    <label>AIR</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="LAND" v-model="dep_mode_of_travel" />
                    <label>LAND</label>
                  </div>
                  <div class="radio-item">
                    <input type="radio" value="SEA" v-model="dep_mode_of_travel" />
                    <label>SEA</label>
                  </div>
                </div>
                <span v-if="hasError('dep_mode_of_travel')" class="error-message">{{
                  getErrorMessage('dep_mode_of_travel') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('dep_mode_of_transport') }">
                <label class="form-label form-label-required">Mode of Transport</label>
                <div class="form-input-group">
                  <select v-model="dep_mode_of_transport" class="form-select"
                    :class="{ error: hasError('dep_mode_of_transport') }">
                    <option disabled value="">Select</option>
                    <option v-for="opt in getTransportOptions(dep_mode_of_travel)" :key="opt" :value="opt"
                      v-show="opt !== 'Select'">{{ opt }}</option>
                  </select>
                  <input type="text" v-model="dep_mode_of_transport_other" class="form-input"
                    placeholder="Please specify" :disabled="dep_mode_of_transport !== 'Others'" />
                </div>
                <span v-if="hasError('dep_mode_of_transport')" class="error-message">{{
                  getErrorMessage('dep_mode_of_transport') }}</span>
                <span v-if="hasError('dep_mode_of_transport_other')" class="error-message">{{
                  getErrorMessage('dep_mode_of_transport_other') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('dep_flight_no') }">
                <label class="form-label form-label-required">Flight No./Vehicle No.</label>
                <input type="text" v-model="dep_flight_no" class="form-input" />
                <span v-if="hasError('dep_flight_no')" class="error-message">{{ getErrorMessage('dep_flight_no')
                }}</span>
              </div>
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

              <div class="form-field" :class="{ error: hasError('district') }">
                <label class="form-label form-label-required">District / Area</label>
                <input type="text" v-model="district" class="form-input" />
                <span v-if="hasError('district')" class="error-message">{{ getErrorMessage('district') }}</span>
              </div>

              <div class="form-field" :class="{ error: hasError('sub_district') }">
                <label class="form-label form-label-required">Sub-District / Sub-Area</label>
                <input type="text" v-model="sub_district" class="form-input" />
                <span v-if="hasError('sub_district')" class="error-message">{{ getErrorMessage('sub_district') }}</span>
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
