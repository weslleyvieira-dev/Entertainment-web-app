import { Router } from "express";
import { BookmarkedController } from "../controllers/bookmarkedController.js";
import { UserController } from "../controllers/userController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();
const bookmarkedController = new BookmarkedController();
const userController = new UserController();

router.post("/auth/login", userController.loginUser);
router.post("/auth/register", userController.registerUser);

router.put("/users/:id/email", checkToken, userController.updateEmail);
router.put("/users/:id/password", checkToken, userController.updatePassword);

router.get("/users/:id/bookmarkeds", bookmarkedController.getAllBookmarked);
router.post("/users/:id/bookmarkeds", bookmarkedController.addItem);
router.delete("/users/:id/bookmarkeds", bookmarkedController.removeItem);

export default router;
