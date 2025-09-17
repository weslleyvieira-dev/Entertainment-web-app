import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import crypto from "crypto";
import { prisma } from "../configs/database.js";
import { EmailTokenType } from "@prisma/client";

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

    const isExpired = dayjs().isAfter(dayjs.unix(storedRefreshToken.expiresIn));

    if (isExpired) {
      await prisma.refreshToken.delete({ where: { id: refreshTokenId } });
      throw new Error("Refresh token expired.");
    }

    const accessToken = await this.generateAccessToken(
      storedRefreshToken.userId
    );
    return accessToken;
  }

  async revokeRefreshToken(userId) {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });

    return result.count;
  }

  async generateEmailToken(userId, type) {
    const id = crypto.randomBytes(20).toString("hex");
    const expiresIn = dayjs().add(30, "minute").unix();
    const enumType = EmailTokenType[type];

    if (!enumType) {
      throw new Error("Invalid email token type.");
    }

    await prisma.emailToken.deleteMany({
      where: {
        userId: userId,
        type: enumType,
      },
    });

    const resetToken = await prisma.emailToken.create({
      data: {
        id,
        userId,
        expiresIn,
        type: enumType,
      },
    });

    return resetToken.id;
  }

  async revokeEmailToken(token) {
    const result = await prisma.emailToken.deleteMany({
      where: {
        id: token,
      },
    });

    return result.count;
  }

  async findEmailTokenById(token) {
    const result = await prisma.emailToken.findUnique({
      where: {
        id: token,
      },
      select: {
        userId: true,
        expiresIn: true,
        type: true,
      },
    });

    return result;
  }
}
