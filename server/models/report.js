import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    reportedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: {
          type: String,
          enum: ["spam", "offensive", "harassment", "misinformation", "off-topic", "other"],
          default: "other",
        },
        details: {
          type: String,
          maxlength: 500,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "reviewing", "dismissed", "action_taken"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNotes: {
      type: String,
      maxlength: 1000,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    action: {
      type: String,
      enum: ["none", "comment_removed", "user_warned", "user_suspended"],
      default: "none",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
reportSchema.index({ commentId: 1 });
reportSchema.index({ videoId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ "reportedBy.userId": 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.model("CommentReport", reportSchema);
