import { ListService } from "../services/listService.js";
import { slugify } from "../utils/slugify.js";

const listService = new ListService();

export class ListController {
  async getUserLists(req, res) {
    try {
      const userId = req.userId;
      const result = await listService.getUserLists(userId);

      res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async getList(req, res) {
    try {
      const userId = req.userId;
      let listId = req.params?.id;
      listId = typeof listId === "string" ? listId.trim() : null;

      if (!listId) {
        throw {
          status: 400,
          message: "List id is missing or invalid.",
        };
      }

      const result = await listService.getList(listId, userId);

      if (!result) {
        throw { status: 404, message: "List not found." };
      }

      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async createList(req, res) {
    try {
      const userId = req.userId;
      let { name } = req.body;
      name = name ? name.trim() : null;

      if (!name || typeof name !== "string") {
        throw {
          status: 400,
          message: "List name is missing or invalid.",
        };
      }

      const slug = slugify(name);
      const userLists = await listService.getUserLists(userId);

      if (
        userLists.some(
          (list) => list.name.toLowerCase() === name.toLowerCase()
        ) ||
        userLists.some((list) => list.slug === slug)
      ) {
        throw {
          status: 409,
          message: "A list with the same name already exists.",
        };
      }

      const result = await listService.createList(userId, name, slug);
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async deleteList(req, res) {
    try {
      const userId = req.userId;
      let listId = req.params?.id;
      listId = typeof listId === "string" ? listId.trim() : null;

      if (!listId) {
        throw {
          status: 400,
          message: "List id is missing or invalid.",
        };
      }

      const searchList = await listService.getList(listId, userId);

      if (!searchList) {
        throw {
          status: 404,
          message: "List not found.",
        };
      }

      await listService.deleteList(listId);
      return res.status(204).send();
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.userId;
      let listId = req.params?.id;
      listId = typeof listId === "string" ? listId.trim() : null;

      if (!listId) {
        throw { status: 400, message: "List id is missing or invalid." };
      }

      const currentList = await listService.getList(listId, userId);
      if (!currentList) {
        throw { status: 404, message: "List not found." };
      }

      let { itemId, type } = req.body;
      type = typeof type === "string" ? type.trim().toLowerCase() : null;

      itemId = Number(itemId);
      if (!Number.isInteger(itemId)) {
        throw { status: 400, message: "Item ID is missing or invalid." };
      }

      if (!type || (type !== "movies" && type !== "series")) {
        throw { status: 400, message: "Item TYPE is missing or invalid." };
      }

      const items = currentList[type];
      if (items.includes(itemId)) {
        return res.status(200).json({ [type]: items });
      }

      const result = await listService.addItem(currentList, { itemId, type });
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.userId;
      let listId = req.params?.id;
      listId = typeof listId === "string" ? listId.trim() : null;

      if (!listId) {
        throw { status: 400, message: "List id is missing or invalid." };
      }

      const currentList = await listService.getList(listId, userId);
      if (!currentList) {
        throw { status: 404, message: "List not found." };
      }

      let itemId = req.params?.itemId;
      let type = req.params?.type;
      type = typeof type === "string" ? type.trim().toLowerCase() : null;

      itemId = Number(itemId);
      if (!Number.isInteger(itemId)) {
        throw { status: 400, message: "Item ID is missing or invalid." };
      }

      if (!type || (type !== "movies" && type !== "series")) {
        throw { status: 400, message: "Item TYPE is missing or invalid." };
      }

      const items = currentList[type];
      if (!items.includes(itemId)) {
        throw { status: 404, message: "Item not found in the list." };
      }

      await listService.removeItem(currentList, { itemId, type });
      return res.status(204).send();
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ error: error.message || "Internal server error." });
    }
  }
}
