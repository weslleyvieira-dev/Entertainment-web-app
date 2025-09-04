import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { TokenController } from "../controllers/tokenController.js";
import { BookmarkController } from "../controllers/bookmarkController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const userController = new UserController();
const tokenController = new TokenController();
const bookmarkController = new BookmarkController();

router.post("/auth/login", userController.loginUser);
router.post("/auth/register", userController.registerUser);
router.post("/auth/logout", checkToken, userController.logoutUser);
router.post("/auth/refresh-token", tokenController.refreshToken);

router.post("/auth/password/forgot", userController.forgotPassword);
router.post("/auth/password/reset/:token", userController.resetPassword);

router.put("/me/email", checkToken, userController.updateEmail);
router.put("/me/password", checkToken, userController.updatePassword);

router.get("/me/bookmarks", checkToken, bookmarkController.getBookmarks);
router.post("/me/bookmarks", checkToken, bookmarkController.addItem);
router.delete(
  "/me/bookmarks/:type/:itemId",
  checkToken,
  bookmarkController.removeItem
);

export default router;
