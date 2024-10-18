const Comments = require("../models/comments.model");
const Connections = require("../models/connection.model");
const Posts = require("../models/post.model");
const { User } = require("../models/user.model");

const search = async (req, res) => {
  const module = req.params.module;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  let data = [];
  if (module === "users") {
    

    const query = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } }, // case-insensitive search for firstname
            { lastname: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    data = await User.find(query).skip(skip).limit(limit);
  } else if (module === "posts") {
    const query = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } }, // case-insensitive search for firstname
            { lastname: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    db = await Posts.find(query).skip(skip).limit(limit);
  }
  res.status(200).json({
    data,
    currentPage: page,
    totalPages: limit > 0 ? Math.ceil(totalUsers / limit) : 1,
    search: req.query.search || "",
  });
};

const renderUsersView = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const search = req.query.search || ""; // Get search query
    const skip = (page - 1) * limit;
    // Filter users based on search query
    const query = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } }, // case-insensitive search for firstname
            { lastname: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query); // Count users based on search

    // Check if it's an AJAX request (from fetch)
    const isAjaxRequest = req.xhr || req.headers.accept.indexOf("json") > -1;

    // Respond with JSON if it's an AJAX request
    if (isAjaxRequest) {
      

      return res.status(200).json({
        users,
        currentPage: page,
        totalPages: limit > 0 ? Math.ceil(totalUsers / limit) : 1,
        totalUsers,
        search: req.query.search || "", // Access search query from URL params
      });
    }

    // For full-page renders
    res.status(200).render("users", {
      users,
      currentPage: page,
      limit,
      totalPages: limit > 0 ? Math.ceil(totalUsers / limit) : 1,
      totalUsers,
      search: req.query.search || "", // Access search query from URL params
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};

const renderUserViewById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).render("error.pug", { message: "User not found" });
    }
    res.status(200).render("users/userDetails", { user });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
///users/:userId/posts
const renderAllUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 posts per page
    const posts = await Posts.find({ auther: req.params.userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("comments") // Optionally populate comments
      .sort({ createdAt: -1 })
      .exec();
    const count = await Posts.countDocuments({ auther: req.params.userId });
    const user = await User.findById(req.params.userId);
    res.render("users/userPosts", {
      user: user,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
///users/:userId/comments
const renderAllUserComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const comments = await Comments.find({ userId: req.params.userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate("postId") // Optionally populate post information
      .exec();
    const count = await Comments.countDocuments({
      userId: req.params.userId,
    });
    const user = await User.findById(req.params.userId);
    res.render("users/userComments", {
      user: user,
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
///users/:userId/connections
const renderAllUserConnections = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const connections = await Connections.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate("senderId receiverId") // Populate both user details
      .exec();
    const count = await Connections.countDocuments({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }],
    });
    const user = await User.findById(req.params.userId);
    res.render("users/userConnections", {
      user: user,
      connections,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
//posts
const renderAllPosts = async (req, res) => {
  try {
    const { page } = parseInt(req.query) || 1;
    const { limit } = parseInt(req.query) || 0;
    const posts = await Posts.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("auther comments") // Optionally populate user and comments
      .sort({ createdAt: -1 })
      .exec();
    const count = await Posts.countDocuments();
    res.render("posts", {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
//comments
const renderAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const comments = await Comments.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId postId") // Optionally populate user and post info
      .sort({ createdAt: -1 })
      .exec();
    const count = await Comments.countDocuments();
    res.render("comments", {
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
const renderCommentById = async (req, res) => {
  const commentId = req.params.id;
  try {
    const comment = await Comments.findById(commentId)
      .populate("userId") // Populates the author of the comment
      .populate({
        path: "replies", // Populate the replies array
        populate: { path: "userId" }, // Populate user info inside each reply
      })
      .exec();

    

    res.render("comments/commentDetails.pug", {
      comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).render("error", {
      back_url: "/api/admin/users",
    });
  }
};
module.exports = {
  renderUsersView,
  renderUserViewById,
  renderAllUserPosts,
  renderAllUserComments,
  renderAllUserConnections,
  renderAllPosts,
  renderAllComments,
  renderCommentById,
  search,
};
