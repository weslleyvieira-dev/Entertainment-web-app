import { prisma } from "../configs/database.js";

export class UserService {
  async registerUser(newUser) {
    const { email, password } = newUser;
    const result = await prisma.user.create({
      data: {
        email,
        password,
      },
      select: {
        email: true,
      },
    });

    return result;
  }

  async updateEmail(id, newEmail) {
    const result = await prisma.user.update({
      where: { id: id },
      data: {
        email: newEmail,
      },
    });

    return result;
  }

  async updatePassword(id, newPassword) {
    const result = await prisma.user.update({
      where: { id: id },
      data: {
        password: newPassword,
      },
    });

    return result;
  }

  async deleteUser(userId) {
    const result = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return result;
  }

  async findUserByEmail(email) {
    const result = await prisma.user.findUnique({
      where: { email: email },
    });
    return result;
  }

  async findUserById(id) {
    const result = await prisma.user.findUnique({
      where: { id: id },
    });

    return result;
  }
}
