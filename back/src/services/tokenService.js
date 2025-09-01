import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import crypto from "crypto";
import { prisma } from "../configs/database.js";

export class TokenService {
  async generateTokens(user) {
    if (!process.env.SECRET) {
      throw new Error("SECRET is not defined in environment variables.");
    }
    try {
      const accessToken = await this.generateAccessToken(user.id);
      const refreshToken = await this.generateRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error(error);
      throw new Error("Error generating tokens.");
    }
  }

  async generateAccessToken(userId) {
    const accessToken = jwt.sign({ id: userId }, process.env.SECRET, {
      expiresIn: "15min",
    });

    return accessToken;
  }

  async generateRefreshToken(userId) {
    await prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });

    const expiresIn = dayjs().add(30, "days").unix();
    const refreshToken = await prisma.refreshToken.create({
      data: {
        userId,
        expiresIn,
      },
    });

    return refreshToken.id;
  }

  async refreshAccessToken(refreshTokenId) {
    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        id: refreshTokenId,
      },
    });

    if (!storedRefreshToken) {
      throw new Error("Refresh token invalid.");
    }

    const accessToken = await this.generateAccessToken(
      storedRefreshToken.userId
    );
    const refreshTokenExpired = dayjs().isAfter(
      dayjs.unix(storedRefreshToken.expiresIn)
    );

    if (refreshTokenExpired) {
      const newRefreshToken = await this.generateRefreshToken(
        storedRefreshToken.userId
      );
      return { accessToken, refreshToken: newRefreshToken };
    }

    return { accessToken, refreshTokenId };
  }

  async revokeRefreshToken(refreshTokenId) {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        id: refreshTokenId,
      },
    });

    return result.count;
  }

  async generatePasswordResetToken(userId) {
    const id = crypto.randomBytes(20).toString("hex");
    const expiresIn = dayjs().add(30, "minute").unix();

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: userId,
      },
    });

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        id,
        userId,
        expiresIn,
      },
    });

    return resetToken.id;
  }

  async revokePassResetToken(resetToken) {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        id: resetToken,
      },
    });

    return result.count;
  }

  async findPassResetTokenById(resetToken) {
    const result = await prisma.passwordResetToken.findUnique({
      where: {
        id: resetToken,
      },
      select: {
        userId: true,
        expiresIn: true,
      },
    });

    return result;
  }
}
