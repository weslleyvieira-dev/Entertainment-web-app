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
    return result.movies;
  }

  async listSeries(userId) {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        series: true,
      },
    });
    return result.series;
  }

  async addMovie(userId, movieId) {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        movies: {
          push: movieId,
        },
      },
    });

    return result.movies;
  }

  async addSerie(userId, serieId) {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        series: {
          push: serieId,
        },
      },
    });

    return result.series;
  }

  async removeMovie(userId, movieId) {
    const movies = await this.listMovies(userId);
    const updatedMovies = movies.filter((movie) => movie !== movieId);

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        movies: {
          set: updatedMovies,
        },
      },
    });

    return result.movies;
  }

  async removeSerie(userId, serieId) {
    const series = await this.listSeries(userId);
    const updatedSeries = series.filter((serie) => serie !== serieId);

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        series: {
          set: updatedSeries,
        },
      },
    });

    return result.series;
  }
}
