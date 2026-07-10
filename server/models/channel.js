import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^@[a-z0-9._-]{3,30}$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalViews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

channelSchema.index({ name: "text", handle: "text" });

export default mongoose.model("Channel", channelSchema);
