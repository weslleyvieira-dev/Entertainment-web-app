import { Router } from "express";
import authRouter from "./authRouter.js";
import listRouter from "./listRouter.js";
import userRouter from "./userRouter.js";
import tmdbRouter from "./tmdbRouter.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/me/lists", listRouter);
router.use("/me", userRouter);
router.use("/tmdb", tmdbRouter);

export default router;
