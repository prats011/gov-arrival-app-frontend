import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { ref } from "vue";

import "@/assets/main.css";

import PrimeVue from "primevue/config";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";

const globalCount = ref(0);
const app = createApp(App);

app.provide("globalCount", globalCount);
app.component("MultiSelect", MultiSelect);
app.component("PSelect", Select);

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#e8f4fd",
      100: "#d1e9fb",
      200: "#a3d3f7",
      300: "#75bdf3",
      400: "#47a7ef",
      500: "#1B6CA3", // Main brand color
      600: "#155a8a",
      700: "#104871",
      800: "#0a3658",
      900: "#05243f",
      950: "#021226",
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      prefix: "p",
      darkModeSelector: "false",
      cssLayer: {
        name: "primevue",
        order: "reset, primevue",
      },
    },
  },
});

app.use(router);
app.mount("#app");
