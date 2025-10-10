import { createRouter, createWebHistory } from "vue-router";
import { authTokenStore } from "@/stores/authTokenStore";
import { bootstrapService } from "@/services/bootstrapService";
import MainLayout from "@/layouts/MainLayout.vue";
const Login = () => import("@/pages/Login.vue");
const SignUp = () => import("@/pages/SignUp.vue");
const ForgotPassword = () => import("@/pages/ForgotPassword.vue");
const ResetPassword = () => import("@/pages/ResetPassword.vue");
const Home = () => import("@/pages/Home.vue");
const Movies = () => import("@/pages/Movies.vue");
const TVSeries = () => import("@/pages/TVSeries.vue");
const Bookmarkeds = () => import("@/pages/Bookmarked.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: { name: "Home" } },
    { path: "/login", name: "Login", component: Login },
    { path: "/sign-up", name: "Sign Up", component: SignUp },
    {
      path: "/forgot-password",
      name: "Forgot Password",
      component: ForgotPassword,
    },
    {
      path: "/reset-password",
      name: "Reset Password",
      component: ResetPassword,
    },
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
        {
          path: "/movies",
          name: "Movies",
          component: Movies,
        },
        {
          path: "/tv-series",
          name: "TV Series",
          component: TVSeries,
        },
        {
          path: "/bookmarkeds",
          name: "Bookmarkeds",
          component: Bookmarkeds,
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const store = authTokenStore();

  if (!store.isBootstrapped) {
    await bootstrapService();
  }

  const isAuthenticated = Boolean(store.accessToken);

  if (to.meta?.requiresAuth && !isAuthenticated) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  if (isAuthenticated && (to.name === "Login" || to.name === "Sign Up")) {
    return { name: "Home" };
  }

  return true;
});

router.afterEach((to) => {
  document.title = `${to.name} - WatchApp` || "Entertainment Web App";
});

export default router;
