import { TokenService } from "../services/tokenService.js";

const tokenService = new TokenService();

export class TokenController {
  async refreshToken(req, res) {
    try {
      let { refreshTokenId } = req.body;
      refreshTokenId = refreshTokenId ? refreshTokenId.trim() : null;

      if (!refreshTokenId) {
        throw {
          status: 422,
          message: "Missing refresh token.",
        };
      }

      const { accessToken, refreshToken } =
        await tokenService.refreshAccessToken(refreshTokenId);

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      if (error.message === "Refresh token invalid.") {
        error.status = 401;
      }

      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }
}
