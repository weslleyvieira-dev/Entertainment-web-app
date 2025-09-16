import { login } from "@/api/backendApi";
import Cookies from "js-cookie";

export default class AuthService {
  async authenticateUser(loginData) {
    try {
      const response = await login(loginData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  storeTokens(tokens) {
    localStorage.setItem("accessToken", tokens.accessToken);
    Cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
  }
}
