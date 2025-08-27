import { Router } from "express";
import { BookmarkedController } from "../controllers/bookmarkedController.js";

const router = Router();
const bookmarkedController = new BookmarkedController();

router.get("/users/:id/all", bookmarkedController.getAllBookmarked);
router.get("/users/:id/movies", bookmarkedController.getBookmarkedMovies);
router.get("/users/:id/series", bookmarkedController.getBookmarkedSeries);

router.patch("/users/:id/movies", bookmarkedController.addMovie);
router.patch("/users/:id/series", bookmarkedController.addSerie);

router.delete("/users/:id/movies", bookmarkedController.removeMovie);
router.delete("/users/:id/series", bookmarkedController.removeSerie);
export default router;
