import { Router } from "express";
import { ListController } from "../controllers/listController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const listController = new ListController();

/**
 * @swagger
 * /me/lists:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get user's lists
 *     description: Returns all lists belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lists returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, example: "clz8abc123" }
 *                   userId: { type: string, example: "user_01HXY..." }
 *                   name: { type: string, example: "Favorites" }
 *                   slug: { type: string, example: "favorites" }
 *                   movies:
 *                     type: array
 *                     items: { type: integer }
 *                     example: [550, 603]
 *                   series:
 *                     type: array
 *                     items: { type: integer }
 *                     example: [1399, 82856]
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.get("/", checkToken, listController.getUserLists);

/**
 * @swagger
 * /me/lists/{id}:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get a list by ID
 *     description: Returns a specific list owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: List ID
 *     responses:
 *       200:
 *         description: List fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: "clz8abc123" }
 *                 userId: { type: string, example: "user_01HXY..." }
 *                 name: { type: string, example: "Favorites" }
 *                 slug: { type: string, example: "favorites" }
 *                 movies:
 *                   type: array
 *                   items: { type: integer }
 *                 series:
 *                   type: array
 *                   items: { type: integer }
 *       400:
 *         description: Invalid ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List id is missing or invalid." }
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       404:
 *         description: List not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List not found." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.get("/:id", checkToken, listController.getList);

/**
 * @swagger
 * /me/lists:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Create a new list
 *     description: Creates a new list for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Watch Later" }
 *     responses:
 *       201:
 *         description: List created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 userId: { type: string }
 *                 name: { type: string }
 *                 slug: { type: string }
 *                 movies:
 *                   type: array
 *                   items: { type: integer }
 *                 series:
 *                   type: array
 *                   items: { type: integer }
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List name is missing or invalid." }
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       409:
 *         description: Name/slug conflict for this user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "A list with the same name already exists." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.post("/", checkToken, listController.createList);

/**
 * @swagger
 * /me/lists/{id}:
 *   delete:
 *     tags:
 *       - Lists
 *     summary: Delete a list by ID
 *     description: Deletes a specific list owned by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: List ID
 *     responses:
 *       204:
 *         description: Deleted successfully.
 *       400:
 *         description: Invalid ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List id is missing or invalid." }
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       404:
 *         description: List not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List not found." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.delete("/:id", checkToken, listController.deleteList);

/**
 * @swagger
 * /me/lists/{id}/items:
 *   put:
 *     tags:
 *       - Lists
 *     summary: Ensure an item exists in the list (idempotent)
 *     description: Adds the item if it does not exist; if it already exists, returns the current state.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, type]
 *             properties:
 *               itemId: { type: integer, example: 123 }
 *               type:
 *                 type: string
 *                 enum: [movies, series]
 *                 example: movies
 *     responses:
 *       200:
 *         description: Current state after idempotent operation (item already existed).
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     movies:
 *                       type: array
 *                       items: { type: integer }
 *                 - type: object
 *                   properties:
 *                     series:
 *                       type: array
 *                       items: { type: integer }
 *       201:
 *         description: Item added.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     movies:
 *                       type: array
 *                       items: { type: integer }
 *                 - type: object
 *                   properties:
 *                     series:
 *                       type: array
 *                       items: { type: integer }
 *       400:
 *         description: Invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Item TYPE is missing or invalid." }
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       404:
 *         description: List not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "List not found." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.put("/:id/items", checkToken, listController.addItem);

/**
 * @swagger
 * /me/lists/{id}/items/{type}/{itemId}:
 *   delete:
 *     tags:
 *       - Lists
 *     summary: Remove an item from a list
 *     description: Removes an item from a user's list.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: List ID
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [movies, series]
 *         description: Item type (movies or series)
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *         description: TMDB item ID
 *     responses:
 *       204:
 *         description: Item removed.
 *       400:
 *         description: Invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Item ID is missing or invalid." }
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Unauthorized - Invalid or missing token." }
 *       404:
 *         description: List or item not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Item not found in the list." }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Internal server error." }
 */
router.delete(
  "/:id/items/:type/:itemId",
  checkToken,
  listController.removeItem
);

export default router;
