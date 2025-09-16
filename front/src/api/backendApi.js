import axios from "axios";

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_APP_API_URL_DEV
  : import.meta.env.VITE_APP_API_URL_PROD;

const backendApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = (loginData) => {
  return backendApi.post("/auth/login", {
    email: loginData.email,
    password: loginData.password,
  });
};
