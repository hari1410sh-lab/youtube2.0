import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { getVideos, uploadVideo, getVideoById, likeVideo, dislikeVideo } from "../models/controller/video.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure memory storage for Cloudinary streaming
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only video files are allowed"));
  },
});

router.get("/", getVideos);
router.get("/:id", getVideoById);
router.post("/upload", upload.single("video"), uploadVideo);
router.patch("/like/:id", likeVideo);
router.patch("/dislike/:id", dislikeVideo);

export default router;