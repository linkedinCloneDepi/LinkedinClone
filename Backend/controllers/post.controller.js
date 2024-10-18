const Posts = require("../models/post.model.js");
const Tag = require("../models/tag.model.js");
const { User } = require("../models/user.model.js");
const { Notification } = require("../models/notification.model.js");
const Connections = require("../models/connection.model.js");
const cloudinary = require("../db/cloudinary.js");

const findMyAcceptedConnectionsIds = async (user) => {
  try {
    let acceptedUsers = [];
    const acceptedConnections = await Promise.all(
      user.connections.map(async (connectionId) => {
        const connection = await Connections.findById(connectionId);
        // 

        if (!connection || connection.status !== "accepted") {
          return null;
        }
        // 
        const friendId =
          String(connection.senderId) !== String(user._id)
            ? connection.senderId
            : connection.receiverId;
        
        
        

        acceptedUsers.push(friendId);
      })
    );

    return acceptedUsers;
  } catch (error) {
    console.error("Error fetching accepted connections:", error);
    return [];
  }
};

const getFeedPosts = async (req, res) => {
  try {
    let posts;
    let tagIds = [];
    const user = req.user;
    

    if (!user) {
      return res.status(404).json({
        message: "user not found!",
      });
    }

    // Find matching tags for the user's title (interest) using regex
    if (user.headline) {
      const userTitleRegex = new RegExp(
        user.headline.split(" ").join("|"),
        "i" // Case-insensitive matching
      );
      const matchingTags = await Tag.find({ name: { $regex: userTitleRegex } });
      tagIds = matchingTags.map((tag) => tag._id);
    }

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || null; // Default to null (all posts) if not provided
    const skip = limit ? (page - 1) * limit : 0; // Calculate the number of posts to skip only if limit is provided

    // Case 1: If the user has no connections, fetch posts based on their interests (tags)
    // Get connections' posts
    posts = await Posts.find({
      auther: { $in: user.connections }, // Fetch posts from connections
    })
      .populate(
        "auther",
        "name firstName lastName username profilePicture headline"
      )
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get user's own posts
    let userPosts = await Posts.find({
      auther: user._id, // Fetch user's own posts
    })
      .populate("auther", "firstName lastName username headline profilePicture")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Combine both connections' posts and user posts
    let combinedPosts = [...posts, ...userPosts];

    // Fetch the rest of the posts excluding connections and user
    const excludedAuthorIds = [...user.connections, user._id];
    let restOfPosts = await Posts.find({
      auther: { $nin: excludedAuthorIds }, // Exclude connections and user's posts
    })
      .populate("auther", "firstName lastName username headline profilePicture")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Combine all posts
    combinedPosts = [...combinedPosts, ...restOfPosts];

    // Sort all posts by createdAt
    combinedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    posts = combinedPosts;

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "No posts found!",
      });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in get all feed posts controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, imgs, videos } = req.body;
    let newPost;
    let imgsList = [];
    const user = req.user;
    
    if (!user) {
      res.status(404).json({
        message: "user not found !",
      });
    }
    if (imgs && videos) {
      newPost = new Posts({
        // auther: req.user._id, // Fix typo (use -> req.user)
        auther: user._id,
        content,
        images: imgsList, // Fix typo: images -> imgs
        videos: videos,
      });
    } else if (imgs) {
      try {
        const uploadResults = await Promise.all(
          imgs.map(async (img) => {
            const result = await cloudinary.uploader.upload(img);
            return result.secure_url; // Collect secure URLs
          })
        );
        imgsList.push(...uploadResults);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Error uploading profile picture",
          imgs: imgs,
          imgsList: imgsList,
        });
      }
      newPost = new Posts({
        auther: req.user._id, // Fix typo (use -> req.user)
        content,
        images: imgsList, // Fix typo: imags -> imgs
        videos: [],
      });
    } else if (videos) {
      newPost = new Posts({
        auther: req.user._id, // Fix typo (use -> req.user)
        content,
        images: imgsList,
        videos: videos,
      });
    } else {
      newPost = new Posts({
        // auther: req.user._id, // Fix typo (use -> req.user)
        auther: user._id,
        content,
      });
    }
    await newPost.save();
    user.posts.push(newPost._id);
    await user.save();
    // Notify all connections about the new post
    const notificationMessage = `${user.username} created a new post`;

    const notifications = user.connectedUsers.map(async (connectionId) => {
      const notification = new Notification({
        type: "posts:all",
        message: notificationMessage,
        relatedId: newPost._id,
        isRead: false,
      });

      const savedNotification = await notification.save();

      // Find the connected user and add the notification
      const connectedUser = await User.findById(connectionId);
      if (connectedUser) {
        connectedUser.notifications.push(savedNotification._id);
        await connectedUser.save();
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notifications);

    res.status(201).json({ data: newPost, imgs: imgs, imgsList: imgsList });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      error: "Failed to create post",
      content: `new ${req.body.content}`,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Posts.findById(postId)
      .populate(
        "auther",
        "name firstName lastName username profilePicture headline"
      )
      .populate("comments.user", "name profilePicture username headline");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Posts.findById(postId);
    const user = req.user;
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.auther.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }
    const sharedUsers = post.shares;

    await Posts.findByIdAndDelete(postId);
    await User.updateMany(
      { _id: { $in: sharedUsers } }, // Find all users in the shares list
      { $pull: { posts: postId } } // Remove the postId from their posts array
    );
    user.posts = user.posts.filter((post) => post != postId);
    await user.save();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    
    res.status(500).json({ message: "Server error" });
  }
};
const deleteShare = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Posts.findById(postId);
    const user = req.user;
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Posts.findByIdAndUpdate(
      postId,
      { $pull: { shares: userId } },
      { new: true }
    );

    user.posts = user.posts.filter((post) => post != postId);
    await user.save();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    
    res.status(500).json({ message: "Server error" });
  }
};
const getAllPosts = async (req, res) => {
  try {
    // Get page and limit from query parameters, default to 1 and null if not provided
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit); // Default to undefined if not provided

    // Calculate the number of posts to skip based on the current page
    const skip = limit ? (page - 1) * limit : 0; // Only calculate skip if limit is defined

    // Fetch posts with pagination, populating the required fields (e.g., 'auther', 'comments')
    const posts = await Posts.find()
      .populate("auther", "firstName lastName username headline profilePicture") // Populate the author field with username
      .populate("tags") // Populate tags if needed
      .skip(skip) // Skip the previous pages' posts
      .limit(limit) // Limit the number of posts to be returned, or null for all
      .sort({ createdAt: -1 }); // Sort posts by creation date (newest first)

    // Get total number of posts for calculating total pages
    const totalPosts = await Posts.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: limit ? Math.ceil(totalPosts / limit) : 1, // Total pages calculated only if limit is defined
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error while fetching posts" });
  }
};

const getAllComments = async (req, res) => {
  try {
    const postId = req.params.id;

    // Get page and limit from query parameters, default to 1 and null if not provided
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit); // Default to undefined if not provided

    // Calculate the number of comments to skip based on the current page
    const skip = limit ? (page - 1) * limit : 0; // Only calculate skip if limit is defined

    // Find the post and populate comments with user details
    const post = await Posts.findById(postId)
      .populate({
        path: "comments",
        options: {
          skip, // Skip the previous pages' comments
          limit, // Limit the number of comments returned, or null for all
        },
        populate: {
          path: "userId",
          select: "firstName lastName username headline profilePicture",
        },
        select: "-postId -__v",
      })
      .select("comments");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get total number of comments for calculating total pages
    const totalComments = await Posts.findById(postId)
      .select("comments")
      .populate("comments")
      .then((p) => p.comments.length);

    res.status(200).json({
      comments: post.comments,
      currentPage: page,
      totalPages: limit ? Math.ceil(totalComments / limit) : 1, // Total pages calculated only if limit is defined
      totalComments,
    });
  } catch (error) {
    console.error("Error in getPostById controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const sharePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const post = await Posts.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { shares: user._id } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      user._id,
      {
        $addToSet: { posts: postId },
      },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //send notification to auther
    const notification = new Notification({
      type: "posts:reposts",
      message: `${user.username} reposted your post`,
      relatedId: post._id,
      isRead: false,
    });
    
    const savedNotification = await notification.save();
    const author = await User.findById(post.auther);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (!author.notifications) {
      author.notifications = [];
    }
    author.notifications.push(savedNotification._id);

    // Save the author's notifications
    await author.save();

    return res.status(200).json({
      message: "Post shared successfully",
      post,
    });
  } catch (error) {
    
    return res.status(500).json({ message: "Error in share a post" });
  }
};

// Export the functions using CommonJS
module.exports = {
  getFeedPosts,
  createPost,
  getPostById,
  deletePost,
  deleteShare,
  getAllPosts,
  getAllComments,
  sharePost,
};
