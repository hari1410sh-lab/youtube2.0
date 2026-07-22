import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  channelname: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  joineDon: {
    type: Date,
    default: Date.now
  },
  watchLater: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },
  planExpiry: {
    type: Date,
    default: null,
  },
  paymentHistory: [
    {
      plan: String,
      amount: Number,
      razorpayPaymentId: String,
      razorpayOrderId: String,
      date: { type: Date, default: Date.now },
    },
  ],
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "dark",
  },
});

export default mongoose.model("User", userSchema);