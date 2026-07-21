import { Readable } from "stream";
import mongoose from "mongoose";
import Video from "../video.js";
import cloudinary from "../../config/cloudinary.js";

const uploadVideoToCloudinary = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "youtube2/videos",
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description, channelName, uploaderEmail } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Video title is required" });
    }

    const originalName = req.file.originalname;
    const safeName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
    const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    const uploadResult = await uploadVideoToCloudinary(req.file.buffer, publicId);

    const videoUrl = uploadResult.secure_url || uploadResult.url || "";
    const thumbnailUrl = uploadResult.thumbnail_url || "";
    const duration = uploadResult.duration || 0;

    const video = await Video.create({
      title: title.trim(),
      description: description?.trim() || "",
      videoUrl,
      thumbnailUrl,
      duration,
      originalName,
      fileName: originalName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      channelName: channelName?.trim() || "",
      uploaderEmail: uploaderEmail?.trim() || "",
    });

    return res.status(201).json({ result: video });
  } catch (error) {
    console.error("Video upload error:", error.message);
    console.error("Full error:", error);
    return res.status(500).json({ message: "Could not upload video", error: error.message });
  }
};

export const getVideos = async (_req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({ result: videos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not fetch videos" });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json({ result: video });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not fetch video" });
  }
};

export const likeVideo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const likeIndex = video.likes.findIndex((uid) => uid.toString() === userId.toString());
    const dislikeIndex = video.dislikes.findIndex((uid) => uid.toString() === userId.toString());

    if (likeIndex === -1) {
      video.likes.push(userId);
      if (dislikeIndex !== -1) {
        video.dislikes.splice(dislikeIndex, 1);
      }
    } else {
      video.likes.splice(likeIndex, 1);
    }

    await video.save();
    return res.status(200).json({ result: video });
  } catch (error) {
    console.error("Error liking video:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikeVideo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const likeIndex = video.likes.findIndex((uid) => uid.toString() === userId.toString());
    const dislikeIndex = video.dislikes.findIndex((uid) => uid.toString() === userId.toString());

    if (dislikeIndex === -1) {
      video.dislikes.push(userId);
      if (likeIndex !== -1) {
        video.likes.splice(likeIndex, 1);
      }
    } else {
      video.dislikes.splice(dislikeIndex, 1);
    }

    await video.save();
    return res.status(200).json({ result: video });
  } catch (error) {
    console.error("Error disliking video:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};