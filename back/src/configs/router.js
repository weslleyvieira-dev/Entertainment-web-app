import { Router } from "express";
import { BookmarkedController } from "../controllers/bookmarkedController.js";

const router = Router();
const bookmarkedController = new BookmarkedController();

router.get("/users/:id/bookmarkeds", bookmarkedController.getAllBookmarked);
router.post("/users/:id/bookmarkeds", bookmarkedController.addItem);
router.delete("/users/:id/bookmarkeds", bookmarkedController.removeItem);

export default router;
