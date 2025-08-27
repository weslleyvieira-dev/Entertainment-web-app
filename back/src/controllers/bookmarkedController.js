import { BookmarkedService } from "../services/bookmarkedService.js";

const bookmarkedService = new BookmarkedService();

export class BookmarkedController {
  async getAllBookmarked(req, res) {
    try {
      const userId = req.params.id;
      const bookmarkeds = await bookmarkedService.listAll(userId);
      res.status(200).send(bookmarkeds);
    } catch (error) {
      console.error(error);
    }
  }

  async getBookmarkedMovies(req, res) {
    try {
      const userId = req.params.id;
      const bookMovies = await bookmarkedService.listMovies(userId);
      res.status(200).send(bookMovies);
    } catch (error) {
      console.error(error);
    }
  }

  async getBookmarkedSeries(req, res) {
    try {
      const userId = req.params.id;
      const bookSeries = await bookmarkedService.listSeries(userId);
      res.status(200).send(bookSeries);
    } catch (error) {
      console.error(error);
    }
  }

  async addMovie(req, res) {
    try {
      const userId = req.params.id;
      const movieId = req.body.id;
      const movie = await bookmarkedService.addMovie(userId, movieId);
      res.status(200).send(movie);
    } catch (error) {
      console.error(error);
    }
  }

  async addSerie(req, res) {
    try {
      const userId = req.params.id;
      const serieId = req.body.id;
      const serie = await bookmarkedService.addSerie(userId, serieId);
      res.status(200).send(serie);
    } catch (error) {
      console.error(error);
    }
  }

  async removeMovie(req, res) {
    try {
      const userId = req.params.id;
      const movieId = req.body.id;
      await bookmarkedService.removeMovie(userId, movieId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
    }
  }

  async removeSerie(req, res) {
    try {
      const userId = req.params.id;
      const serieId = req.body.id;
      await bookmarkedService.removeSerie(userId, serieId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
    }
  }
}
