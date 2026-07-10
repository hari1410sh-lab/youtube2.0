import mongoose from "mongoose";
import Comment from "../comment.js";

export const addComment = async (req, res) => {
  const { videoId } = req.params;
  const { userId, userName, userImage, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!userId || !text?.trim()) {
    return res.status(400).json({ message: "User ID and comment text are required" });
  }

  try {
    const comment = await Comment.create({
      videoId,
      userId,
      userName: userName || "",
      userImage: userImage || "",
      text: text.trim(),
    });

    return res.status(201).json({ result: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Could not add comment" });
  }
};

export const getComments = async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    const comments = await Comment.find({ videoId }).sort({ createdAt: -1 });
    return res.status(200).json({ result: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Could not fetch comments" });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(id);
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Could not delete comment" });
  }
};
