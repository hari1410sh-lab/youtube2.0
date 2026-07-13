import mongoose from "mongoose";
import Video from "../video.js";

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const { title, description, channelName, uploaderEmail } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Video title is required" });
    }

    const video = await Video.create({
      title: title.trim(),
      description: description?.trim() || "",
      videoUrl: `/uploads/videos/${req.file.filename}`,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      channelName: channelName?.trim() || "",
      uploaderEmail: uploaderEmail?.trim() || "",
    });

    return res.status(201).json({ result: video });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not upload video" });
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
