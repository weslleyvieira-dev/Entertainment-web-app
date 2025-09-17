import { authTokenStore } from "@/stores/authTokenStore";
import { backendApi } from "@/api/backendApi";

export async function bootstrapService() {
  const store = authTokenStore();
  store.initFromStorage();
  try {
    const { data } = await backendApi.post("/auth/refresh-token", undefined, {
      _skipAutoRefresh: true,
      _skipAuth: true,
    });
    if (data?.accessToken) {
      store.setSession(data.accessToken);
    } else {
      store.clearSession();
    }
  } catch {
    store.clearSession();
  } finally {
    store.markBootstrapped();
  }
}
