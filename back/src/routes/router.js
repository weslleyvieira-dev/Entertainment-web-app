import { Router } from "express";
import authRouter from "./authRouter.js";
import bookmarkRouter from "./bookmarkRouter.js";
import userRouter from "./userRouter.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/me/bookmarks", bookmarkRouter);
router.use("/me", userRouter);

export default router;
