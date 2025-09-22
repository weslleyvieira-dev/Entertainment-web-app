import axios from "axios";

const baseURL = import.meta.env.VITE_APP_TMDB_URL;
const baseImageURL = import.meta.env.VITE_APP_TMDB_IMG_URL;
const apiToken = import.meta.env.VITE_APP_TMDB_TOKEN;

export const tmdbImageUrl = (path, size) =>
  path ? `${baseImageURL}/${size}${path}` : "";
export const imgTrending = (path) => tmdbImageUrl(path, "w1280");
export const imgDefault = (path) => tmdbImageUrl(path, "w780");

export const tmdbApi = axios.create({
  baseURL,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiToken}`,
  },
});

tmdbApi.interceptors.request.use((config) => {
  config.params = {
    include_adult: false,
    ...config.params,
  };
  return config;
});

tmdbApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const cfg = error.config || {};
    if (status === 429 && !cfg._retry429) {
      cfg._retry429 = true;
      const retryAfter = Number(error.response.headers?.["retry-after"] || 1);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return tmdbApi(cfg);
    }
    return Promise.reject(error);
  }
);
