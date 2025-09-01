import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { TokenController } from "../controllers/tokenController.js";
import { BookmarkedController } from "../controllers/bookmarkedController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const userController = new UserController();
const tokenController = new TokenController();
const bookmarkedController = new BookmarkedController();

router.post("/auth/login", userController.loginUser);
router.post("/auth/register", userController.registerUser);
router.post("/auth/logout", userController.logoutUser);
router.post("/auth/refresh-token", tokenController.refreshToken);
router.get("/auth/reset-password", userController.forgotPassword);
router.post("/auth/reset-password/:token", userController.resetPassword);

router.put("/users/:id/email", checkToken, userController.updateEmail);
router.put("/users/:id/password", checkToken, userController.updatePassword);

router.get("/users/:id/bookmarkeds", bookmarkedController.getAllBookmarked);
router.post("/users/:id/bookmarkeds", bookmarkedController.addItem);
router.delete("/users/:id/bookmarkeds", bookmarkedController.removeItem);

export default router;
