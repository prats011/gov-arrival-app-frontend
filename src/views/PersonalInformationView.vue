<script setup>
import { ref, onMounted, inject, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import ProgressBar from '@/components/ProgressBar.vue';
import infoIcon from '/personalIcon.svg';
import PassportIcon from '/worldIcon.svg';
import data_country from '@/assets/dataCountry.json';
import data_months from '@/assets/dataDate.json';

const router = useRouter();
const count = inject('globalCount');

const option_month = ref([]);
const option_day = ref([]);
const option_year = ref([]);
const selected_year = ref('');
const selected_month = ref('');
const selected_day = ref('');

const selected_nationality = ref('');
const selected_country = ref('');
const selected_city = ref('');

const family_name = ref('');
const first_name = ref('');
const middle_name = ref('');
const passport_no = ref('');
const occupation = ref('');
const gender = ref('');
const option_gender = ref([]);
const visa_no = ref('');
const phone_no = ref('');
const phone_no_code = ref('');

const option_country = ref([]);
const option_nationality = ref([]);

const validationErrors = ref({});
const showErrors = ref(false);

const textInputSchema = z.string()
  .trim()
  .min(1, "This field is required")
  .max(80, "Maximum 80 characters allowed")
  .regex(/^[\p{L}\s\-'\.]+$/u, "No special characters are allowed");

const optionalTextInputSchema = z.string()
  .trim()
  .max(80, "Maximum 80 characters allowed")
  .refine(val => val === '' || !/[0-9]/.test(val), "Numbers are not allowed")
  .refine(val => val === '' || /^[A-Za-z\s\-'\.]+$/.test(val), "Only letters A-Z are allowed.")
  .optional()
  .nullable();

const dropdownSchema = z.any().refine(val => val !== '' && val !== null && val !== undefined, "Please select an option");

const phoneCodeSchema = z.string()
  .trim()
  .min(1, "Country code is required")
  .max(4, "Maximum 4 digits allowed")
  .refine(val => /^[0-9]+$/.test(val), "Only numbers are allowed");

const phoneNumberSchema = z.string()
  .trim()
  .min(4, "Minimum 4 digits required")
  .max(17, "Maximum 17 digits allowed")
  .refine(val => /^[0-9]+$/.test(val), "Only numbers are allowed");

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

const hasPhoneError = () => {
  return showErrors.value && (
    !!validationErrors.value['phone_no'] ||
    !!validationErrors.value['phone_no_code']
  );
};

const getPhoneErrorMessage = () => {
  if (validationErrors.value['phone_no_code']) {
    return validationErrors.value['phone_no_code'];
  }
  if (validationErrors.value['phone_no']) {
    return validationErrors.value['phone_no'];
  }
  return '';
};

const personalInfoSchema = z.object({
  family_name: textInputSchema,
  first_name: textInputSchema,
  middle_name: optionalTextInputSchema,
  passport_no: z.string().min(1, "Passport number is required").max(20, "Maximum 20 characters allowed"),
  selected_nationality: dropdownSchema,
  occupation: textInputSchema,
  gender: z.string().min(1, "Please select a gender"),
  visa_no: z.string().max(22, "Maximum 22 characters allowed").optional().nullable(),
  selected_country: dropdownSchema,
  selected_city: dropdownSchema,
  phone_no_code: phoneCodeSchema,
  phone_no: phoneNumberSchema,
  date_of_birth: dateSchema
});

const formattedDate = computed(() => {
  if (selected_year.value && selected_month.value && selected_day.value) {
    const year = selected_year.value;
    const month = selected_month.value.toString().padStart(2, '0');
    const day = selected_day.value.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
});

const validateField = (fieldName, value) => {
  try {
    let schema;

    switch (fieldName) {
      case 'family_name':
      case 'first_name':
        schema = textInputSchema;
        break;
      case 'middle_name':
      case 'visa_no':
        schema = optionalTextInputSchema;
        break;
      case 'passport_no':
        schema = z.string().min(1, "Passport number is required").max(80, "Maximum 80 characters allowed");
        break;
      case 'occupation':
        schema = textInputSchema;
        break;
      case 'selected_nationality':
      case 'selected_country':
      case 'selected_city':
        schema = dropdownSchema;
        break;
      case 'gender':
        schema = z.string().min(1, "Please select a gender");
        break;
      case 'phone_no_code':
        schema = phoneCodeSchema;
        break;
      case 'phone_no':
        schema = phoneNumberSchema;
        break;
      case 'date_of_birth':
        schema = dateSchema;
        value = {
          year: selected_year.value,
          month: selected_month.value,
          day: selected_day.value
        };
        break;
      default:
        return;
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
    family_name: family_name.value,
    first_name: first_name.value,
    middle_name: middle_name.value,
    passport_no: passport_no.value,
    selected_nationality: selected_nationality.value,
    occupation: occupation.value,
    gender: gender.value,
    visa_no: visa_no.value,
    selected_country: selected_country.value,
    selected_city: selected_city.value,
    date_of_birth: {
      year: selected_year.value,
      month: selected_month.value,
      day: selected_day.value
    },
    phone_no_code: phone_no_code.value,
    phone_no: phone_no.value,
  };

  try {
    personalInfoSchema.parse(formData);
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

watch(family_name, (newVal) => validateField('family_name', newVal));
watch(first_name, (newVal) => validateField('first_name', newVal));
watch(middle_name, (newVal) => validateField('middle_name', newVal));
watch(passport_no, (newVal) => validateField('passport_no', newVal));
watch(selected_nationality, (newVal) => validateField('selected_nationality', newVal));
watch(occupation, (newVal) => validateField('occupation', newVal));
watch(gender, (newVal) => validateField('gender', newVal));
watch(visa_no, (newVal) => validateField('visa_no', newVal));
watch(selected_country, (newVal) => validateField('selected_country', newVal));
watch(selected_city, (newVal) => validateField('selected_city', newVal));
watch(phone_no_code, (newVal) => validateField('phone_no_code', newVal));
watch(phone_no, (newVal) => validateField('phone_no', newVal));

watch([selected_year, selected_month, selected_day], () => {
  validateField('date_of_birth', null);
});

onMounted(() => {
  option_month.value = data_months.months;
  option_day.value = data_months.days;
  option_year.value = data_months.years;

  option_country.value = data_country.map(c => ({
    country: `${c.symbol}: ${c.country}`,
    symbol: c.symbol,
    cities: c.cities
  }));

  option_nationality.value = data_country.map(c => ({
    name: c.name,
    symbol: c.symbol,
    country: c.country
  }));

  option_gender.value = [
    { label: 'MALE', value: 'MALE' },
    { label: 'FEMALE', value: 'FEMALE' },
    { label: 'UNDEFINED', value: 'UNDEFINED' }
  ];

  count.value = 0;
});

watch(selected_country, () => {
  selected_city.value = '';
  delete validationErrors.value['selected_city'];
});

const deleteClicked = () => {
  family_name.value = '';
  first_name.value = '';
  middle_name.value = '';
  passport_no.value = '';
  occupation.value = '';
  gender.value = '';
  visa_no.value = '';
  phone_no.value = '';
  phone_no_code.value = '';
  selected_year.value = '';
  selected_month.value = '';
  selected_day.value = '';
  selected_nationality.value = '';
  selected_country.value = '';
  selected_city.value = '';
  validationErrors.value = {};
  showErrors.value = false;
}

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
  router.push("/new/trip-&-accomodation-information");
};

const getErrorMessage = (fieldName) => {
  return validationErrors.value[fieldName] || '';
};

const hasError = (fieldName) => {
  return showErrors.value && !!validationErrors.value[fieldName];
};
</script>

<template>
  <header class="app-header">
    Arrival Card > Add Arrival Card
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
              <img :src="PassportIcon" alt="Passport icon">
              <h2 class="card-title">Personal Information In Passport</h2>
            </div>
            <hr class="card-divider">

            <div class="form-grid">
              <div class="form-field" :class="{ error: hasError('family_name') }">
                <label class="form-label form-label-required">Family Name</label>
                <input type="text" class="form-input" :class="{ error: hasError('family_name') }" v-model="family_name"
                  placeholder="Only letters A-Z are allowed. Enter '-' if none" />
                <span v-if="hasError('family_name')" class="error-message">
                  {{ getErrorMessage('family_name') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('first_name') }">
                <label class="form-label form-label-required">First Name</label>
                <input type="text" class="form-input" :class="{ error: hasError('first_name') }" v-model="first_name"
                  placeholder="Only letters A-Z are allowed." />
                <span v-if="hasError('first_name')" class="error-message">
                  {{ getErrorMessage('first_name') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('middle_name') }">
                <label class="form-label">Middle Name</label>
                <input type="text" class="form-input" :class="{ error: hasError('middle_name') }" v-model="middle_name"
                  placeholder="Only letters A-Z are allowed." />
                <span v-if="hasError('middle_name')" class="error-message">
                  {{ getErrorMessage('middle_name') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('passport_no') }">
                <label class="form-label form-label-required">Passport No.</label>
                <input type="text" class="form-input" :class="{ error: hasError('passport_no') }"
                  v-model="passport_no" />
                <span v-if="hasError('passport_no')" class="error-message">
                  {{ getErrorMessage('passport_no') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('selected_nationality') }">
                <label class="form-label form-label-required">Nationality/Citizenship</label>
                <PSelect v-model="selected_nationality" :options="option_nationality" optionLabel="country"
                  placeholder="Select a Country" :filter="true" filterBy="country"
                  :class="{ error: hasError('selected_nationality') }" />
                <span v-if="hasError('selected_nationality')" class="error-message">
                  {{ getErrorMessage('selected_nationality') }}
                </span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="card-header">
              <img :src="infoIcon" alt="Info icon">
              <h2 class="card-title">Personal Information</h2>
            </div>
            <hr class="card-divider">

            <div class="form-grid">
              <div class="form-field" :class="{ error: hasError('date_of_birth') }">
                <label class="form-label form-label-required">Date of Birth</label>
                <div class="date-inputs">
                  <select v-model="selected_year" class="form-select" :class="{ error: hasError('date_of_birth') }">
                    <option disabled value="">yyyy</option>
                    <option v-for="option in option_year" :key="option.value" :value="String(option.value)">
                      {{ option.name }}
                    </option>
                  </select>
                  <select v-model="selected_month" class="form-select" :class="{ error: hasError('date_of_birth') }">
                    <option disabled value="">mm</option>
                    <option v-for="option in option_month" :key="option.value" :value="String(option.value)">
                      {{ option.name }}
                    </option>
                  </select>
                  <select v-model="selected_day" class="form-select" :class="{ error: hasError('date_of_birth') }">
                    <option disabled value="">dd</option>
                    <option v-for="option in option_day" :key="option.value" :value="String(option.value)">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
                <span v-if="hasError('date_of_birth')" class="error-message">
                  {{ getErrorMessage('date_of_birth') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('occupation') }">
                <label class="form-label form-label-required">Occupation</label>
                <input type="text" class="form-input" :class="{ error: hasError('occupation') }" v-model="occupation" />
                <span v-if="hasError('occupation')" class="error-message">
                  {{ getErrorMessage('occupation') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('gender') }">
                <label class="form-label form-label-required">Gender</label>
                <PSelect v-model="gender" :options="option_gender" optionLabel="label" optionValue="value"
                  placeholder="Select Gender" :class="{ error: hasError('gender') }" />
                <span v-if="hasError('gender')" class="error-message">
                  {{ getErrorMessage('gender') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('visa_no') }">
                <label class="form-label">Visa No.</label>
                <input type="text" class="form-input" :class="{ error: hasError('visa_no') }" v-model="visa_no" />
                <span v-if="hasError('visa_no')" class="error-message">
                  {{ getErrorMessage('visa_no') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('selected_country') }">
                <label class="form-label form-label-required">Country/Territory of Residence</label>
                <PSelect v-model="selected_country" :options="option_country" optionLabel="country"
                  placeholder="Select a Country" :filter="true" filterBy="country"
                  :class="{ error: hasError('selected_country') }" />
                <span v-if="hasError('selected_country')" class="error-message">
                  {{ getErrorMessage('selected_country') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasError('selected_city') }">
                <label class="form-label form-label-required">City/State of Residence</label>
                <PSelect v-model="selected_city" :options="selected_country?.cities || []" placeholder="Select a City"
                  :filter="true" :disabled="!selected_country" :class="{ error: hasError('selected_city') }" />
                <span v-if="hasError('selected_city')" class="error-message">
                  {{ getErrorMessage('selected_city') }}
                </span>
              </div>

              <div class="form-field" :class="{ error: hasPhoneError() }">
                <label class="form-label form-label-required">Phone No.</label>
                <div class="phone-inputs">
                  <span class="phone-prefix">+</span>
                  <input type="tel" class="form-input phone-code" :class="{ error: hasPhoneError() }"
                    v-model="phone_no_code" placeholder="Code" maxlength="4">
                  <input type="tel" class="form-input" :class="{ error: hasPhoneError() }" v-model="phone_no"
                    placeholder="Phone No." maxlength="17" />
                </div>
                <div class="error-messages">
                  <span v-if="hasPhoneError()" class="error-message">
                    {{ getPhoneErrorMessage() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="deleteClicked()">
              Delete this traveler
            </button>
            <button type="submit" class="btn btn-primary">
              Continue
            </button>
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
.form-field.error .PSelect {
  border-color: #ef4444;
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
}

.error-messages {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>