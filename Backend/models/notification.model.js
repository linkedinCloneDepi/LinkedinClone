const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "all",
        "connectionRequest",
        "message",
        "posts:reposts",
        "posts:likes",
        "posts:comments",
        "posts:all",
        "mentions",
      ], // Example types
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
); 
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = {
  Notification,
};
