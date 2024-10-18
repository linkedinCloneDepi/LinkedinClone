const { Notification } = require("../models/notification.model.js");
const { User } = require("../models/user.model.js");
const getAllNotification = async (req, res) => {
  try {
    const { notificationType } = req.query;

    const userNotificationIds = req.user.notifications;

    let query = { _id: { $in: userNotificationIds } };

    if (notificationType && notificationType !== "all") {
      query.type = notificationType;
    }

    const notifications = await Notification.find(query)
      .populate({
        path: "relatedId",
        select: "content auther",
        populate: {
          path: "auther", // This should match the reference key in your postSchema
          select: "username firstName lastName profilePicture", // Select the fields you need from the User model
        },
      })
      .sort({ createdAt: -1 });
    

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || notifications.length;

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    // Prepare the response object
    const response = {
      totalNotifications: notifications.length,
      currentPage: page,
      totalPages: Math.ceil(notifications.length / limit),
      notifications: paginatedNotifications,
    };
    
    

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    

    const notification = await Notification.findById(req.params.id);
    

    if (!notification) {
      return res.status(404).json({ message: "notification not found" });
    }
    res.json(notification);
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};
const changeNotificationStatus = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "notification not found" });
    }
    notification.isRead = true;
    res.json(notification);
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const user = req.user;
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }

    // Remove the notification from the Notification collection
    await Notification.findByIdAndDelete(notificationId);

    // Remove the notification ID from the user's notifications array
    await User.findByIdAndUpdate(
      user._id,
      { $pull: { notifications: notificationId } },
      { new: true }
    );

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};
module.exports = {
  getNotificationById,
  getAllNotification,
  changeNotificationStatus,
  deleteNotification,
};
