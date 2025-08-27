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
}
