const express = require("express");

const postController = require("../controllers/post.controller.js");
const multer = require("multer");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "../uploads/") });
const { verifyTokenAndUserCheck } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/admin", verifyTokenAndUserCheck, postController.getAllPosts);
router.get("/", verifyTokenAndUserCheck, postController.getFeedPosts);
router.patch("/share", verifyTokenAndUserCheck, postController.sharePost); // takes userId who repost and postId that is been reposted
router.get("/comments/:id", verifyTokenAndUserCheck, postController.getAllComments);
router.post(
  "/",
  verifyTokenAndUserCheck,
  upload.fields([{ name: "Images" }]),
  postController.createPost
);
router.get("/:id", verifyTokenAndUserCheck, postController.getPostById);
router.delete("/:id", verifyTokenAndUserCheck, postController.deletePost);
router.delete("/share/:id", verifyTokenAndUserCheck, postController.deleteShare);

module.exports = router;
