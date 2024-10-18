const Posts = require("../models/post.model.js");
const Tag = require("../models/tag.model.js");
const { User } = require("../models/user.model.js");
const { Notification } = require("../models/notification.model.js");
const Comments = require("../models/comments.model.js");

// helper functions
const findPost = async (postId) => {
  const post = await Posts.findById(postId);
  if (!post) return null;
  return post;
};
const findUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  return user;
};

const findComment = async (commentId) => {
  // Find the comment in the Comment schema, ensuring it belongs to the user and post
  const existingComment = await Comments.findById(commentId);
  return existingComment;
};

// controllers
const addComment = async (req, res) => {
  try {
    const { imgs, videos, comment, postId } = req.body;
    const userId = req.userId;
    // Find the post and user
    const post = await Posts.findById(postId);
    const user = req.user;

    if (!post || !user) {
      return res.status(404).json({ error: "Post or user not found" });
    }

    // Create a new comment
    let newComment = new Comments({
      content: comment,
      postId: post._id,
      userId: user._id,
      images: imgs || [],
      videos: videos || [],
    });

    // Save the new comment
    await newComment.save();

    await Posts.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment._id } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $push: { comments: newComment._id } },
      { new: true }
    );
    //send notification to auther
    const notification = new Notification({
      type: "posts:comments",
      message: `${user.username} commented on your post`,
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
    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

const editComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { imgs, videos, comment } = req.body;
    // Find the post and user (ensure these functions return the post and user)
    const user = req.user;

    const existingComment = await findComment(commentId);

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found !" });
    }

    const postId = existingComment.postId;
    const post = await findPost(postId);

    if (!post || !user) {
      return res.status(404).json({ error: "Post or user not found" });
    }
    // Update the comment's content and media (images, videos)
    existingComment.content = comment;

    if (imgs && videos) {
      existingComment.media.images = imgs;
      existingComment.media.videos = videos;
    } else if (imgs) {
      existingComment.media.images = imgs;
      existingComment.media.videos = [];
    } else if (videos) {
      existingComment.media.images = [];
      existingComment.media.videos = videos;
    } else {
      existingComment.media = {
        images: [],
        videos: [],
      };
    }

    // Save the updated comment
    await existingComment.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment: existingComment,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ error: "Failed to edit comment" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id
    // Find the comment to delete
    const commentToDelete = await Comments.findById(commentId).populate(
      "replies"
    );

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const postId = commentToDelete.postId;

    // Recursively delete all replies
    const repliesToDelete = commentToDelete.replies; // Get all replies to the comment

    // If there are replies, delete them
    if (repliesToDelete.length > 0) {
      await Comments.deleteMany({ _id: { $in: repliesToDelete } });
    }

    // Now delete the original comment
    
    
    await Posts.findByIdAndUpdate(
      postId,
      { $pull: { comments: commentId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $pull: { comments: commentId } }, 
      { new: true }
    );
    const deletedComment = await Comments.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res
      .status(200)
      .json({ message: "Comment and its replies deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment and replies:", error);
    res.status(500).json({ message: "Internal server error",error:error });
  }
};

const addReply = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { userId, content, imgs, videos } = req.body;

    // Find the parent comment to which we are adding a reply
    const parentComment = await findComment(commentId);
    const postId = parentComment.postId;

    // Create a new reply as a comment
    const newReply = new Comments({
      userId: userId,
      postId: postId,
      content,
      media: {
        images: imgs || [],
        videos: videos || [],
      },
      parentComment: commentId,
    });

    // Save the new reply
    await newReply.save();

    // Add the reply's ID to the replies array of the parent comment
    parentComment.replies.push(newReply._id);
    await parentComment.save();

    res.status(201).json({
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};

const deleteReply = async (req, res) => {
  try {
    const commentId = req.params.id; // This is the reply ID
    const { userId } = req.body;

    if (!commentId || !userId) {
      return res
        .status(400)
        .json({ message: "Comment ID and User ID are required." });
    }

    // Find the reply to delete
    const reply = await findComment(commentId); // Assume findComment fetches the comment or reply

    if (!reply) {
      return res.status(404).json({ error: "Reply not found or unauthorized" });
    }

    // Find the parent comment of the reply
    const parentComment = await Comments.findById(reply.parentComment).populate(
      "replies"
    );

    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found" });
    }

    // Remove the reply from the parent comment's replies array
    await Comments.findByIdAndUpdate(
      reply.parentComment,
      { $pull: { replies: commentId } }, // Assuming replies is the field that holds the replies
      { new: true }
    );

    // Delete the reply and all its replies
    await Comments.deleteMany({ _id: { $in: reply.replies } });
    await Comments.findByIdAndDelete(commentId); // Finally delete the reply itself

    res
      .status(200)
      .json({ message: "Reply and its replies deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ error: "Failed to remove reply" });
  }
};

// display controllers

const getAllComments = async (req, res) => {
  try {
    // Extract pagination parameters from the query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 100; // Default limit; adjust as needed

    // Fetch all comments from the database with pagination
    const comments = await Comments.find()
      .populate("userId", "username") // Populate userId with username (optional)
      .skip((page - 1) * limit) // Skip the documents for the current page
      .limit(limit); // Limit the number of results

    // Check if any comments exist
    if (!comments.length) {
      return res.status(404).json({ message: "No comments found" });
    }

    // Count total comments for pagination
    const totalComments = await Comments.countDocuments();

    // Prepare the response object
    const response = {
      totalComments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      comments,
    };

    // Return the list of comments
    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

const getCommentById = async (req, res) => {
  try {
    const commentId = req.params.id;

    // Ensure commentId is provided
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    // Find the comment by its ID
    const comment = await Comments.findById(commentId)
      .populate("userId", "username") // Populate username from the Users collection
      .populate({
        path: "postId",
        populate: {
          path: "auther",
          select: "username",
        },
        select: "auther",
      })
      .exec();
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Respond with the comment
    res.status(200).json({ comment });
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export the functions using CommonJS
module.exports = {
  addComment,
  editComment,
  deleteComment,
  addReply,
  deleteReply,
  getAllComments,
  getCommentById,
};
