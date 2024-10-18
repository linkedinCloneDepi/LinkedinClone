const { User } = require("../models/user.model.js");
const Posts = require("../models/post.model.js");
const Connections = require("../models/connection.model.js");
const { Notification } = require("../models/notification.model.js");
const cloudinary = require("../db/cloudinary.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const getSuggstedConnections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const currentUser = req.user;

    // Get IDs of users in pending connections
    const pendingConnections = await Connections.find({
      $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
      status: "pending",
    });

    const pendingUserIds = pendingConnections.map((connection) =>
      connection.senderId.toString() === currentUser._id.toString()
        ? connection.receiverId
        : connection.senderId
    );

    // Find suggested users (excluding current user, connected users, and pending connections)
    let suggestedUsers = await User.find({
      _id: {
        $ne: currentUser._id,
        $nin: [...currentUser.connectedUsers, ...pendingUserIds],
      },
    })
      .populate({
        path: "connections", // Populating the connections field
      })
      .select("firstName lastName username profilePicture headline connections") // Fields to return from the user
      .skip(skip)
      .limit(limit);

    // Add connectionStatus for each suggested user
    suggestedUsers = suggestedUsers.map((user) => {
      // Check if the current user has a connection with the suggested user
      const userConnection = user.connections.find(
        (connection) =>
          connection.senderId.toString() === currentUser._id.toString() ||
          connection.receiverId.toString() === currentUser._id.toString()
      );

      // Convert user to plain JS object to modify it
      user = user.toObject();

      // Assign connectionStatus based on whether a connection exists
      user.connectionStatus = userConnection
        ? userConnection.status
        : "connect";

      // Remove the connections field from the user object
      delete user.connections;

      return user;
    });

    // Get total number of suggested users for calculating total pages
    const totalSuggestedUsers = await User.countDocuments({
      _id: {
        $ne: currentUser._id,
        $nin: [...currentUser.connectedUsers, ...pendingUserIds],
      },
    });

    res.status(200).json({
      suggestedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalSuggestedUsers / limit),
      totalSuggestedUsers,
    });
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    
    // edit it because it was not working with findOne
    const user = await User.findById(req.params.id).select(
      "-password -notifications"
    ).populate({path:"connections"});
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Get page and limit from query parameters, default to 1 and null if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    // Calculate the number of users to skip based on the current page
    const skip = limit ? (page - 1) * limit : 0;
    const search = req.query.search || "";

    // Construct search query with case-insensitive regex for name, username, etc.
    const query = {
      ...(search
        ? {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
      _id: { $ne: req.user.id },
    }; // If no search term, return all users

    var users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .select("firstName lastName username profilePicture headline")
      .populate({
        path: "connections",
        select: "senderId receiverId status",
      });

    users = users.map((user) => {
      const userConnection = user.connections.find(
        (connection) =>
          connection.senderId.toString() === req.user.id ||
          connection.receiverId.toString() === req.user.id
      );

      // If a connection is found, set the status; otherwise, default to "connect"
      user = user.toObject(); // Convert mongoose document to plain JS object
      user.connectionStatus = userConnection
        ? userConnection.status
        : "connect";

      return user;
    });
    // Get total number of users for calculating total pages
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: limit ? Math.ceil(totalUsers / limit) : 1, // Total pages calculated only if limit is defined
      totalUsers,
      connectionstatus: "", //pending, accepted, notFriend,
    });
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    let user = req.user;
    const userId = req.params.userId;
    if (userId && userId !== req.user._id) {
      user = await User.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has any posts
    if (!user.posts || !user.posts.length) {
      return res.status(200).json({
        message: "User has no posts",
        totalPosts: 0,
        currentPage: 1,
        totalPages: 0,
        posts: [],
      });
    }

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page

    const posts = await Posts.find({ _id: { $in: user.posts } })

      .populate("auther") // Example: populate the user who created the post
      .select("-password")
      .skip((page - 1) * limit) // Skip posts for the current page
      .limit(limit) // Limit the number of posts per page
      .sort({ createdAt: -1 });

    // Count total posts for pagination
    const totalPosts = user.posts.length;

    // Prepare the response object
    const response = {
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    };

    res.status(200).json(response);
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};

const getUserComments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comments = user.comments || [];
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || comments.length; // Default to send all comments

    // Calculate the start and end indices for pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Paginate the comments
    const paginatedComments = comments.slice(startIndex, endIndex);

    // Prepare the response object
    const response = {
      totalComments: comments.length,
      currentPage: page,
      totalPages: Math.ceil(comments.length / limit),
      comments: paginatedComments,
    };

    res.status(200).json(response);
  } catch (error) {
    
    res.status(500).json({ message: "server error" });
  }
};
const UpdateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];
    const updatedData = {};

    // Validate input fields
    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    });
    // Handle profile picture upload
    if (req.files && req.files.profilePicture) {
      try {
        const result = await cloudinary.uploader.upload(
          req.files.profilePicture.path
        );
        updatedData.profilePicture = result.secure_url;
      } catch (uploadError) {
        return res
          .status(500)
          .json({ success: false, message: "Error uploading profile picture" });
      }
    }

    // Handle banner image upload
    if (req.files && req.files.bannerImg) {
      try {
        const result = await cloudinary.uploader.upload(
          req.files.bannerImg.path
        );
        updatedData.bannerImg = result.secure_url;
      } catch (uploadError) {
        return res
          .status(500)
          .json({ success: false, message: "Error uploading banner image" });
      }
    }

    // Update the user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addExperience = async (req, res) => {
  try {
    const user = req.user;
    user.experience.push(req.body);
    await user.save();
    res.status(200).json({ experience: user.experience });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const addSkills = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Make sure the incoming skill is an object
  const skill = { name: req.body.name };
  user.skills.push(skill);
  await user.save();
  res.status(200).json(user);
};

const addEducation = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.education.push(req.body);
  await user.save();
  res.status(200).json(user);
};

const addSection = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.section.push(req.body);
  await user.save();
  res.status(200).json(user);
};

const getNotification = async (req, res) => {
  const userId = req.user._id;
  const user = req.user;
  const { page = 1, limit = 10, isRead, type } = req.query;

  try {
    const query = { user: userId };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find({
      _id: { $in: user.notifications },
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    if (!notifications) return res.status(404).send("No notifications found");

    res.status(200).send(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const addNotificationToUser = async (req, res) => {
  try {
    // Log the incoming request body
    

    // Validate if required fields are present
    if (!req.body.type || !req.body.message) {
      return res.status(400).json({ error: "Type and message are required." });
    }

    // Create a new notification
    const notification = new Notification({
      type: req.body.type,
      message: req.body.message,
    });

    // Save the notification
    const savedNotification = await notification.save();
    

    // Find the user by ID from req.params
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the saved notification's _id to the user's notifications array
    user.notifications.push(savedNotification._id);

    // Save the updated user with new notifications
    await user.save();
    

    // Send the response with the updated user notifications
    res.status(200).json({ success: true, notifications: user.notifications });
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ error: "Error adding notification" });
  }
};

const getUserConnections = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionOfUser = await Promise.all(
      user.connectedUsers.map(async (connectionId) => {
        return await User.findById(connectionId).select(
          "profilePicture firstName lastName headline username"
        );
      })
    );

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || connectionOfUser.length; // Default to send all connections

    // Calculate the start and end indices for pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Paginate the connections
    const paginatedConnections = connectionOfUser.slice(startIndex, endIndex);

    // Prepare the response object
    const response = {
      totalConnections: connectionOfUser.length,
      currentPage: page,
      totalPages: Math.ceil(connectionOfUser.length / limit),
      connections: paginatedConnections,
    };

    return res.status(200).json({
      message: "Success",
      ...response,
    });
  } catch (error) {
    
    return res
      .status(500)
      .json({ message: "Error in getting user connections" });
  }
};

module.exports = {
  getSuggstedConnections,
  getPublicProfile,
  UpdateProfile,
  getAllUsers,
  getUserPosts,
  deleteUser,
  getUserComments,
  addSection,
  addExperience,
  addSkills,
  addEducation,
  getNotification,
  addNotificationToUser,
  getUserConnections,
};
