import { backendApi } from "@/api/backendApi";
import { authTokenStore } from "@/stores/authTokenStore.js";

export default class AuthService {
  async loginUser(credentials) {
    const response = await backendApi.post("/auth/login", credentials, {
      _skipAutoRefresh: true,
      _skipAuth: true,
    });
    const store = authTokenStore();

    if (response.data?.accessToken) {
      store.setSession(response.data.accessToken, response.data.user);
    }

    return {
      status: response.status,
      data: response.data,
    };
  }

  async signUpUser(credentials) {
    const response = await backendApi.post("/auth/register", credentials, {
      _skipAutoRefresh: true,
      _skipAuth: true,
    });

    return {
      status: response.status,
      data: response.data,
    };
  }

  async forgotPassword(credentials) {
    const response = await backendApi.post(
      "/auth/password/forgot",
      credentials,
      {
        _skipAutoRefresh: true,
        _skipAuth: true,
      }
    );

    return {
      status: response.status,
      data: response.data,
    };
  }

  async resetPassword(credentials) {
    const { token, newPassword, newPasswordConfirm } = credentials;
    const response = await backendApi.post(
      `/auth/password/reset/${encodeURIComponent(token)}`,
      { newPassword, newPasswordConfirm },
      {
        _skipAutoRefresh: true,
        _skipAuth: true,
      }
    );

    return {
      status: response.status,
      data: response.data,
    };
  }

  async logoutUser() {
    const token = localStorage.getItem("accessToken");
    const response = await backendApi.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    const store = authTokenStore();
    store.clearSession();

    return {
      status: response.status,
      data: response.data,
    };
  }
}
