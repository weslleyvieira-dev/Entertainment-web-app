import { BookmarkService } from "../services/bookmarkService.js";

const bookmarkService = new BookmarkService();

export class BookmarkController {
  async getBookmarks(req, res) {
    try {
      const userId = req.userId;
      let type = req.query.type ?? null;
      type = type ? type.trim() : null;

      if (type && type !== "movies" && type !== "series") {
        throw {
          status: 400,
          message:
            "Bookmark type is invalid. Should be either 'movies' or 'series'.",
        };
      }

      const items = await bookmarkService.listItems(userId, type);

      let bookmarks;
      if (type) {
        bookmarks = {
          [type]: items || [],
        };
      } else {
        bookmarks = {
          movies: items.movies,
          series: items.series,
        };
      }

      res.status(200).json(bookmarks);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.userId;
      let { itemId, type } = req.body;

      itemId = itemId ? itemId.trim() : null;
      type = type ? type.trim() : null;

      if (!itemId) {
        throw {
          status: 400,
          message: "Item ID is missing or invalid.",
        };
      }

      if (!type || (type !== "movies" && type !== "series")) {
        throw {
          status: 400,
          message:
            "Bookmark type is invalid or missing. Should be either 'movies' or 'series'.",
        };
      }

      const items = await bookmarkService.addItem(userId, itemId, type);

      res.status(200).json({ [type]: items });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.userId;
      let { itemId, type } = req.params;

      itemId = itemId ? itemId.trim() : null;
      type = type ? type.trim() : null;

      if (!itemId) {
        throw {
          status: 400,
          message: "Item ID is missing or invalid.",
        };
      }

      if (!type || (type !== "movies" && type !== "series")) {
        throw {
          status: 400,
          message:
            "Bookmark type is invalid or missing. Should be either 'movies' or 'series'.",
        };
      }

      await bookmarkService.removeItem(userId, itemId, type);
      res.status(204).end();
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }
}
