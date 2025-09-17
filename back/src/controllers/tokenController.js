import { TokenService } from "../services/tokenService.js";

const tokenService = new TokenService();

export class TokenController {
  async refreshToken(req, res) {
    try {
      const refreshTokenId = req.cookies?.refreshToken?.trim();

      if (!refreshTokenId) {
        throw {
          status: 401,
          message: "Missing refresh token.",
        };
      }

      const accessToken = await tokenService.refreshAccessToken(refreshTokenId);

      res.set("Cache-Control", "no-store");
      return res.status(200).json({ accessToken });
    } catch (error) {
      if (error.message === "Refresh token invalid.") {
        error.status = 401;
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/",
        });
      }

      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }
}
