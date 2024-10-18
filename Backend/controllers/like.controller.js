const Comments = require("../models/comments.model");
const { Notification } = require("../models/notification.model");
const Posts = require("../models/post.model");
const { User } = require("../models/user.model");

const sendNotification = async (module) => {
  //   send notification to auther
  try {
    // 

    const author = await User.findById(module.auther);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    if (!author.notifications) {
      author.notifications = [];
    }
    const notification = new Notification({
      type: "posts:likes",
      message: `${author.username} liked your post`,
      relatedId: module._id,
      isRead: false,
    });
    
    const savedNotification = await notification.save();

    author.notifications.push(savedNotification._id);
    // Save the author's notifications
    await author.save();
  } catch (error) {
    
  }
};

const addLike = async (req, res) => {
  try {
    const { typeId, type } = req.body;
    const userId = req.user._id;

    // Check if the newStatus is valid
    const validTypes = ["post", "comment"];
    let module;
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid types are: post, comment.",
      });
    }
    if (!typeId || !userId) {
      return res
        .status(400)
        .json({ message: "Comment ID and User ID are required." });
    }
    if (type === "comment") {
      // Fetch the comment document
      let comment = await Comments.findById(typeId);

      // Check if the userId is already in the likes array
      if (!comment.likes.includes(userId)) {
        // Add the userId to the likes array if it's not already present
        module = await Comments.findByIdAndUpdate(
          typeId,
          { $addToSet: { likes: userId } }, // $addToSet adds userId only if it's not already in the array
          { new: true } // Return the updated document
        );
      } else {
        return res.status(400).json({
          message: "You can't like the same comment more than one time!",
          status: "bad request",
        });
      }
    } else if (type === "post") {
      // Fetch the post document
      let post = await Posts.findById(typeId);

      // Check if the userId is already in the likes array
      if (!post.likes.includes(userId)) {
        // Add the userId to the likes array if it's not already present
        module = await Posts.findByIdAndUpdate(
          typeId,
          { $addToSet: { likes: userId } }, // $addToSet adds userId only if it's not already in the array
          { new: true } // Return the updated document
        );
      } else {
        return res.status(400).json({
          message: "You can't like the same post more than one time!",
          status: "bad request",
        });
      }
    }
    //todo make this function applicable for post,comments,replies , ex: make content type = post so like added to post,etc..
    sendNotification(module);
    //send notification to auther
    // const notification = new Notification({
    //   type: "like",
    //   message: `${user.username} liked your {post}`,
    //   relatedId: post._id,
    //   isRead: false,
    // });
    // 
    // const savedNotification = await notification.save();
    // const author = await User.findById(post.auther);
    // if (!author) {
    //   return res.status(404).json({ message: "Author not found" });
    // }

    // if (!author.notifications) {
    //   author.notifications = [];
    // }
    // author.notifications.push(savedNotification._id);

    // // Save the author's notifications
    // await author.save();

    res.status(200).json({ message: "Like added successfully", body: module });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(500).json({ error: "Failed to add like" });
  }
};

const deleteLike = async (req, res) => {
  try {
    const { typeId, type } = req.body;
    const userId = req.userId;


    if (!typeId || !userId) {
      return res.status(400).json({
        message: "Comment ID and User ID are required.",
        
      });
    }
    const validTypes = ["post", "comment"];
    let module;
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid types are: post, comment.",
      });
    }
    // Remove the userId from the likes array in the comment

    if (type === "post") {
      module = await Posts.findByIdAndUpdate(
        typeId,
        { $pull: { likes: userId } }, // $pull removes the userId from the likes array
        { new: true } // Return the updated document after the change
      );
    } else if (type === "comment") {
      module = await Comments.findByIdAndUpdate(
        typeId,
        { $pull: { likes: userId } }, // $pull removes the userId from the likes array
        { new: true } // Return the updated document after the change
      );
    }
    if (!module) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res
      .status(200)
      .json({ message: "Like removed successfully", body: module });
  } catch (error) {
    console.error("Error deleting like:", error);
    res.status(500).json({ error: "Failed to remove like" });
  }
};

module.exports = {
  addLike,
  deleteLike,
};
