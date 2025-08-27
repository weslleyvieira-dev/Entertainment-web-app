import { Router } from "express";
import { BookmarkedController } from "../controllers/bookmarkedController.js";

const router = Router();
const bookmarkedController = new BookmarkedController();

router.get("/users/:id/bookmarked", bookmarkedController.getAllBookmarked);
router.get(
  "/users/:id/bookmarkedMovies",
  bookmarkedController.getBookmarkedMovies
);
router.get(
  "/users/:id/bookmarkedSeries",
  bookmarkedController.getBookmarkedSeries
);

export default router;
