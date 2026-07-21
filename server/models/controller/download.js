import mongoose from "mongoose";
import Download from "../download.js";
import Video from "../video.js";
import User from "../auth.js";

const PLAN_LIMITS = {
  Free: 1,
  Bronze: 3,
  Silver: 5,
  Gold: Infinity,
};

export const requestDownload = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid video or user ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const limit = PLAN_LIMITS[user.plan] ?? 1;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = await Download.countDocuments({
      user: userId,
      downloadedAt: { $gte: startOfToday },
    });

    if (todayCount >= limit) {
      return res.status(403).json({
        message: `Daily download limit reached for your ${user.plan} plan (${limit}/day). Upgrade your plan to download more.`,
      });
    }

    const download = await Download.create({
      user: userId,
      video: videoId,
      plan: user.plan,
    });

    return res.status(200).json({
      result: {
        downloadId: download._id,
        videoUrl: video.videoUrl,
        title: video.title,
        remainingToday: limit === Infinity ? "Unlimited" : limit - todayCount - 1,
      },
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserDownloads = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const downloads = await Download.find({ user: userId })
      .populate("video")
      .sort({ downloadedAt: -1 });

    return res.status(200).json({ result: downloads });
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};