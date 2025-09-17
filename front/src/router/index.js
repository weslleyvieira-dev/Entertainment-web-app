import { createRouter, createWebHistory } from "vue-router";
import { authTokenStore } from "@/stores/authTokenStore";

const Login = () => import("@/pages/Login.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "login", component: Login },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

router.beforeEach((to) => {
  const store = authTokenStore();
  const isAuthed = !!store.accessToken;

  if (to.meta?.requiresAuth && !isAuthed) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
