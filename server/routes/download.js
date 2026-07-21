import express from "express";
import { requestDownload, getUserDownloads } from "../models/controller/download.js";

const router = express.Router();

router.post("/request/:videoId", requestDownload);
router.get("/user/:userId", getUserDownloads);

export default router;