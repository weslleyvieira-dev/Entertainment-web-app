import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /me/email:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user email
 *     description: Updates the authenticated user's email address.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 example: "new@email.com"
 *     responses:
 *       200:
 *         description: Email updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email updated successfully.
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       409:
 *         description: New email is already registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: New email is already registered.
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid new email format.
 *       503:
 *         description: Error sending email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error sending email, try again later.
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
router.put("/email", checkToken, userController.updateEmail);

/**
 * @swagger
 * /me/password:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user password
 *     description: Updates the authenticated user's password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required.
 *       503:
 *         description: Error sending email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error sending email, try again later.
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
router.put("/password", checkToken, userController.updatePassword);

/**
 * @swagger
 * /me/request-delete:
 *   post:
 *     tags:
 *       - User
 *     summary: Request account deletion
 *     description: Sends an email with a confirmation link to delete the authenticated user's account.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: If the email is registered, you will receive instructions to delete your account shortly.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If the email is registered, you will receive instructions to delete your account shortly.
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       503:
 *         description: Error sending email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error sending email, try again later.
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
router.post("/request-delete", checkToken, userController.requestDeleteUser);

/**
 * @swagger
 * /me/confirm-delete/{token}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Confirm account deletion
 *     description: Confirms account deletion using the token sent by email.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token received by email to confirm account deletion.
 *     responses:
 *       204:
 *         description: User deleted successfully.
 *       400:
 *         description: Invalid or expired reset link.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired reset link.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       503:
 *         description: Error sending email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error sending email, try again later.
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
router.delete("/confirm-delete/:token", userController.confirmDeleteUser);

export default router;
