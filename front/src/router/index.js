import { createRouter, createWebHistory } from "vue-router";
import { authTokenStore } from "@/stores/authTokenStore";
import MainLayout from "@/layouts/MainLayout.vue";
const Login = () => import("@/pages/Login.vue");
const SignUp = () => import("@/pages/SignUp.vue");
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
