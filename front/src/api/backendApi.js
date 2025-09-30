import axios from "axios";
import { authTokenStore } from "@/stores/authTokenStore";

const baseURL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://watch-api-wellsz.vercel.app";

export const backendApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

backendApi.interceptors.request.use((config) => {
  const store = authTokenStore();
  if (!config._skipAuth && store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`;
  }
  return config;
});

let refreshPromise = null;

backendApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (!status || status !== 401) {
      return Promise.reject(error);
    }

    if (original?._skipAutoRefresh || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = backendApi
          .post(
            "/auth/refresh-token",
            {},
            {
              _skipAutoRefresh: true,
              _skipAuth: true,
            }
          )
          .then(({ data }) => {
            const token = data?.accessToken;
            if (!token) throw new Error("Missing accessToken on refresh.");
            const store = authTokenStore();
            store.setSession(token);
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return backendApi(original);
    } catch (err) {
      const store = authTokenStore();
      if (typeof store.clearSession === "function") store.clearSession();
      return Promise.reject(err);
    }
  }
);
