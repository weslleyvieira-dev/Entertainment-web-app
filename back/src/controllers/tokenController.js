import { TokenService } from "../services/tokenService.js";

const tokenService = new TokenService();

export class TokenController {
  async refreshToken(req, res) {
    try {
      if (!req.body) {
        return res.status(400).send("Request body is missing.");
      }

      const { refreshTokenId } = req.body;

      if (!refreshTokenId || !refreshTokenId.trim()) {
        return res.status(422).send("Missing refresh token.");
      }

      const { accessToken, refreshToken } =
        await tokenService.refreshAccessToken(refreshTokenId);

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.log(error);
      if (error.message === "Refresh token invalid.") {
        return res.status(401).send("Refresh token invalid.");
      } else {
        return res
          .status(500)
          .send("Internal server error. Please try again later.");
      }
    }
  }
}
