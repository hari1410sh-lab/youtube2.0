import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      default: "",
    },
    userImage: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    language: {
      type: String,
      default: "en",
      enum: ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "hi", "ar", "pl", "tr", "nl", "sv", "no", "da", "fi", "el", "cs", "hu", "ro", "th", "vi", "id"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    spam_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ videoId: 1, likes: 1 });
commentSchema.index({ isReported: 1 });

export default mongoose.model("Comment", commentSchema);
