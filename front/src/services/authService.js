import { backendApi } from "@/api/backendApi";
import { authTokenStore } from "@/stores/authTokenStore.js";

export default class AuthService {
  async authenticateUser(credentials) {
    const { data } = await backendApi.post("/auth/login", credentials, {
      _skipAutoRefresh: true,
      _skipAuth: true,
    });
    const store = authTokenStore();
    if (data?.accessToken) {
      store.setSession(data.accessToken, data.user);
    }
    return data;
  }
}
