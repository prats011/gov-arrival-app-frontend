import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("@/views/HomeView.vue");
const PersonalInformation = () => import("@/views/PersonalInformationView.vue");
const TripAccomadation = () => import("@/views/TripAccomadationView.vue");
const HealthDeclaration = () => import("@/views/HealthDeclarationView.vue");
const Success = () => import("@/views/SuccessView.vue");
const CommingSoon = () => import("@/views/CommingSoonView.vue");

const routes = [
  { path: "/", component: Home },
  { path: "/new", redirect: "/" },

  { path: "/new/personal-information", component: PersonalInformation },
  { path: "/new/trip-&-accomodation-information", component: TripAccomadation },
  { path: "/new/health-declaration", component: HealthDeclaration },
  { path: "/new/success", component: Success },

  { path: "/update/search", component: CommingSoon },
  { path: "/update", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
