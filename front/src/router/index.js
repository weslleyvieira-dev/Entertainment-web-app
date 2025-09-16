import { createRouter, createWebHistory } from "vue-router";

const Login = () => import("@/pages/Login.vue");

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: Login, component: Login },
    { path: "/home" },
  ],
});
