const express = require("express");
const multer = require("multer");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "../uploads/") });
const {
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
} = require("../controllers/user.controller.js");

const { verifyTokenAndUserCheck } = require("../middleware/verifyToken.js");

const router = express.Router();

//get
router.get("/", verifyTokenAndUserCheck, getAllUsers);
router.get("/suggestions", verifyTokenAndUserCheck, getSuggstedConnections);
router.get("/connections", verifyTokenAndUserCheck, getUserConnections);
router.get("/posts", verifyTokenAndUserCheck, getUserPosts);
router.get("/comments", verifyTokenAndUserCheck, getUserComments);
router.get("/notifications", verifyTokenAndUserCheck, getNotification); // use pagination  page = 1, limit = 10, isRead, type
router.get("/:id", verifyTokenAndUserCheck, getPublicProfile); //example api call: http://localhost:5000/api/users/id
router.get("/posts/:userId", verifyTokenAndUserCheck, getUserPosts);
// router.get("/:id", verifyTokenAndUserCheck, addSection);

//delete
router.delete("/:id", verifyTokenAndUserCheck, deleteUser); //deleting profile

//post
router.post("/experience", verifyTokenAndUserCheck, addExperience);
router.post("/education", verifyTokenAndUserCheck, addEducation);
router.post("/skill", verifyTokenAndUserCheck, addSkills);
router.post("/section", verifyTokenAndUserCheck, addSection);
router.post(
  "/:id/notification",
  verifyTokenAndUserCheck,
  addNotificationToUser
); //provide type and message => req.body =>:{type: req.body.type,message: req.body.message,}
//types of notification => "connectionRequest", "message", "like", "comment", "jobAlert"

//put
router.post(
  "/:id",
  upload.fields([{ name: "profilePicture" }, { name: "bannerImg" }]),
  UpdateProfile
); 

router.put(
  "/profile",
  verifyTokenAndUserCheck,
  upload.fields([{ name: "profilePicture" }, { name: "bannerImg" }]),
  UpdateProfile
);

module.exports = router;
