import { createRouter, createWebHistory } from "vue-router";

const Login = () => import("@/pages/Login.vue");

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "login", component: Login },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});
