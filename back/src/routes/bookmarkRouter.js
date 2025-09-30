import { Router } from "express";
import { BookmarkController } from "../controllers/bookmarkController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const bookmarkController = new BookmarkController();

/**
 * @swagger
 * /me/bookmarks:
 *   get:
 *     tags:
 *       - Bookmarks
 *     summary: Get user's bookmarks
 *     description: Returns a list of the authenticated user's bookmarks. You can filter by type (movies or series).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movies, series]
 *         required: false
 *         description: Filter bookmarks by type (movies or series)
 *     responses:
 *       200:
 *         description: List of bookmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       400:
 *         description: Invalid bookmark type. Must be either 'movies' or 'series'.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid bookmark type. Must be either 'movies' or 'series'.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.get("/", checkToken, bookmarkController.getBookmarks);

/**
 * @swagger
 * /me/bookmarks:
 *   post:
 *     tags:
 *       - Bookmarks
 *     summary: Add an item to user's bookmarks
 *     description: Adds a movie or series to the authenticated user's bookmarks.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: integer
 *                 example: 1285016
 *               type:
 *                 type: string
 *                 enum: [movies, series]
 *                 example: "movies"
 *     responses:
 *       200:
 *         description: Item added to bookmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 series:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: Item ID or bookmark type is invalid or missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bookmark type is invalid or missing. Should be either 'movies' or 'series'.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.post("/", checkToken, bookmarkController.addItem);

/**
 * @swagger
 * /me/bookmarks/{type}/{itemId}:
 *   delete:
 *     tags:
 *       - Bookmarks
 *     summary: Remove an item from user's bookmarks
 *     description: Removes a movie or series from the authenticated user's bookmarks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [movies, series]
 *         description: The type of bookmark (movies or series)
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the item to remove
 *     responses:
 *       200:
 *         description: Item successfully removed from bookmarks
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     movies:
 *                       type: array
 *                       items:
 *                         type: integer
 *                 - type: object
 *                   properties:
 *                     series:
 *                       type: array
 *                       items:
 *                         type: integer
 *       400:
 *         description: Item ID or bookmark type is invalid or missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bookmark type is invalid or missing. Should be either 'movies' or 'series'.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.delete("/:type/:itemId", checkToken, bookmarkController.removeItem);

export default router;
