import { BookmarkedService } from "../services/bookmarkedService.js";

const bookmarkedService = new BookmarkedService();

export class BookmarkedController {
  async getAllBookmarked(req, res) {
    try {
      const userId = req.params.id;
      const type = req.query.type ?? null;
      const items = await bookmarkedService.listItems(userId, type);
      res.status(200).send(items);
    } catch (error) {
      console.error(error);
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.params.id;
      const itemId = req.body.id;
      const type = req.body.type;

      const items = await bookmarkedService.addItem(userId, itemId, type);
      res.status(200).send(items);
    } catch (error) {
      console.error(error);
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.params.id;
      const itemId = req.body.id;
      const type = req.body.type;

      await bookmarkedService.removeItem(userId, itemId, type);
      res.status(204).send();
    } catch (error) {
      console.error(error);
    }
  }
}
