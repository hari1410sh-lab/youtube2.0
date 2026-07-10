import express from "express";
import { login, toggleWatchLater, getWatchLater, getLikedVideos } from "../models/controller/auth.js";
const router = express.Router();

router.post("/login", login);
router.patch("/watch-later/:videoId", toggleWatchLater);
router.get("/watch-later/:userId", getWatchLater);
router.get("/liked-videos/:userId", getLikedVideos);

export default router;

