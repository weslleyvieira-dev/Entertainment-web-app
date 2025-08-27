import { prisma } from "../configs/database.js";

export class BookmarkedService {
  async listAll(userId) {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        movies: true,
        series: true,
      },
    });
    return result;
  }

  async listMovies(userId) {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        movies: true,
      },
    });
    return result;
  }

  async listSeries(userId) {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        series: true,
      },
    });
    return result;
  }
}
