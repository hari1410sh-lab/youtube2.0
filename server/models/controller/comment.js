import mongoose from "mongoose";
import Comment from "../comment.js";
import CommentReport from "../report.js";
import { validateComment, detectLanguage } from "../../utils/moderation.js";
import { translateText } from "../../utils/translation.js";

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
    // Validate comment (profanity, spam, length checks)
    const validation = validateComment(text);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: "Comment not allowed", 
        reason: validation.reason 
      });
    }

    const comment = await Comment.create({
      videoId,
      userId,
      userName: userName || "",
      userImage: userImage || "",
      text: text.trim(),
      language: validation.language || "en",
      spam_score: 0,
      likes: [],
      dislikes: [],
    });

    return res.status(201).json({ result: comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Could not add comment" });
  }
};

export const getComments = async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({ videoId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .lean();

    const total = await Comment.countDocuments({ videoId });

    // Transform response to include engagement counts
    const commentsWithCounts = comments.map(comment => ({
      ...comment,
      likesCount: comment.likes.length,
      dislikesCount: comment.dislikes.length,
    }));

    return res.status(200).json({ 
      result: commentsWithCounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      }
    });
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
    // Also delete any reports for this comment
    await CommentReport.deleteMany({ commentId: id });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Could not delete comment" });
  }
};

export const likeComment = async (req, res) => {
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

    // Prevent liking own comment
    if (comment.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot like your own comment" });
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userIdStr);
    
    if (hasLiked) {
      // Remove like
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    } else {
      // Add like and remove dislike if exists
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    }

    await comment.save();
    
    return res.status(200).json({ 
      result: comment,
      likesCount: comment.likes.length,
      dislikesCount: comment.dislikes.length,
      userLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return res.status(500).json({ message: "Could not update like" });
  }
};

export const dislikeComment = async (req, res) => {
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

    // Prevent disliking own comment
    if (comment.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot dislike your own comment" });
    }

    const userIdStr = userId.toString();
    const hasDisliked = comment.dislikes.some(id => id.toString() === userIdStr);
    
    if (hasDisliked) {
      // Remove dislike
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      // Add dislike and remove like if exists
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    }

    await comment.save();
    
    return res.status(200).json({ 
      result: comment,
      likesCount: comment.likes.length,
      dislikesCount: comment.dislikes.length,
      userDisliked: !hasDisliked,
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    return res.status(500).json({ message: "Could not update dislike" });
  }
};

export const reportComment = async (req, res) => {
  const { id } = req.params;
  const { userId, reason, details } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const validReasons = ["spam", "offensive", "harassment", "misinformation", "off-topic", "other"];
  if (reason && !validReasons.includes(reason)) {
    return res.status(400).json({ message: "Invalid report reason" });
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Prevent reporting own comment
    if (comment.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot report your own comment" });
    }

    // Check if user already reported this comment
    let report = await CommentReport.findOne({ commentId: id });
    
    if (!report) {
      // Create new report
      report = await CommentReport.create({
        commentId: id,
        videoId: comment.videoId,
        reportedBy: [
          {
            userId,
            reason: reason || "other",
            details: details || "",
          },
        ],
        status: "pending",
      });
    } else {
      // Add to existing report if user hasn't reported yet
      const userIdStr = userId.toString();
      const alreadyReported = report.reportedBy.some(r => r.userId.toString() === userIdStr);
      
      if (!alreadyReported) {
        report.reportedBy.push({
          userId,
          reason: reason || "other",
          details: details || "",
        });
      } else {
        return res.status(400).json({ message: "You have already reported this comment" });
      }
    }

    // Update comment flags
    comment.isReported = true;
    comment.reportCount = report.reportedBy.length;
    await comment.save();
    
    // Update report save
    await report.save();

    return res.status(200).json({ 
      message: "Comment reported successfully",
      reportId: report._id,
      totalReports: report.reportedBy.length,
    });
  } catch (error) {
    console.error("Error reporting comment:", error);
    return res.status(500).json({ message: "Could not report comment" });
  }
};

export const translateComment = async (req, res) => {
  const { id } = req.params;
  const { targetLang = "en" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  try {
    const comment = await Comment.findById(id).lean();
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // If already in target language, return original
    if (comment.language === targetLang) {
      return res.status(200).json({
        commentId: id,
        original: comment.text,
        translated: comment.text,
        sourceLang: comment.language,
        targetLang,
        isSameLanguage: true,
      });
    }

    // Translate
    const result = await translateText(comment.text, targetLang, comment.language);

    if (result.success) {
      return res.status(200).json({
        commentId: id,
        original: comment.text,
        translated: result.translated,
        sourceLang: comment.language,
        targetLang,
        detectedSourceLang: result.detectedSourceLang,
      });
    } else {
      return res.status(500).json({
        message: "Translation failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error translating comment:", error);
    return res.status(500).json({ message: "Could not translate comment" });
  }
};
