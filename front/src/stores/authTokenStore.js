import { defineStore } from "pinia";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export const authTokenStore = defineStore("authToken", {
  state: () => ({
    accessToken: null,
    user: null,
    isBootstrapped: false,
  }),
  actions: {
    initFromStorage() {
      if (this.isBootstrapped) return;
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);
      this.accessToken = token || null;
      if (userRaw) {
        try {
          this.user = JSON.parse(userRaw);
        } catch {
          localStorage.removeItem(USER_KEY);
          this.user = null;
        }
      }
    },
    setSession(accessToken, user = undefined) {
      this.accessToken = accessToken || null;
      if (user !== undefined) {
        this.user = user;
      }
      if (this.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      if (this.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      } else if (user !== undefined) {
        localStorage.removeItem(USER_KEY);
      }
    },
    clearSession() {
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    markBootstrapped() {
      this.isBootstrapped = true;
    },
  },
});
