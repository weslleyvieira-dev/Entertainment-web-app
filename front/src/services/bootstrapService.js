import { backendApi } from "@/api/backendApi";
import { authTokenStore } from "@/stores/authTokenStore";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function bootstrapService() {
  const store = authTokenStore();
  store.initFromStorage();
  if (!store.accessToken || isTokenExpired(store.accessToken)) {
    try {
      const { data } = await backendApi.post(
        "/auth/refresh-token",
        {},
        {
          _skipAutoRefresh: true,
          _skipAuth: true,
        }
      );
      if (data?.accessToken) {
        store.setSession(data.accessToken);
      }
    } catch {
      store.clearSession();
    }
  }
  store.markBootstrapped();
}
