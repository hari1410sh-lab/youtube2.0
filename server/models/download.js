import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    required: true,
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

downloadSchema.index({ user: 1, downloadedAt: -1 });

export default mongoose.model("Download", downloadSchema);