import { createRouter, createWebHistory } from "vue-router";
import { authTokenStore } from "@/stores/authTokenStore";
import MainLayout from "@/layouts/MainLayout.vue";
const Login = () => import("@/pages/Login.vue");
const SignUp = () => import("@/pages/SignUp.vue");
const Home = () => import("@/pages/Home.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: { name: "Home" } },
    { path: "/login", name: "Login", component: Login },
    { path: "/sign-up", name: "Sign Up", component: SignUp },
    {
      path: "/",
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "/home",
          name: "Home",
          component: Home,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const store = authTokenStore();
  const isAuthenticated = Boolean(store.accessToken);

  if (to.meta?.requiresAuth && !isAuthenticated) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  if (isAuthenticated && (to.name === "Login" || to.name === "Sign Up")) {
    return { name: "Home" };
  }

  return true;
});

export default router;
