import mongoose from "mongoose";
import users from "../auth.js";
import Video from "../video.js";

export const login = async (req, res) => {
  const { email, name, image } = req.body;
  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      try {
        const newUser = await users.create({
          email,
          name,
          image,
          channelname: name || "My Channel",
          description: "",
        });
        return res.status(200).json({ result: newUser });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "something went wrong" });
      }
    } else {
      return res.status(200).json({ result: existingUser });
    }
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ message: "something went wrong" });
  }
};

export const toggleWatchLater = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(404).json({ message: "Video not found" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.watchLater.findIndex(
      (vid) => vid.toString() === videoId.toString()
    );

    if (index === -1) {
      user.watchLater.push(videoId);
    } else {
      user.watchLater.splice(index, 1);
    }

    await user.save();
    return res.status(200).json({ result: user });
  } catch (error) {
    console.error("Error toggling watch later:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getWatchLater = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const user = await users.findById(userId).populate("watchLater");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ result: user.watchLater });
  } catch (error) {
    console.error("Error fetching watch later:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getLikedVideos = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const likedVideos = await Video.find({ likes: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ result: likedVideos });
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

