const express = require("express");
const {
  getAllNotification,
  getNotificationById,
  changeNotificationStatus,
  //   changeConnectionStatus,
  deleteNotification,
} = require("../controllers/notification.controller.js");
const { verifyTokenAndUserCheck } = require("../middleware/verifyToken");

const router = express.Router();
router.get("/",verifyTokenAndUserCheck, getAllNotification);
router.get("/:id", verifyTokenAndUserCheck,getNotificationById);
router.patch("/:id", verifyTokenAndUserCheck,changeNotificationStatus);
router.delete("/:id", verifyTokenAndUserCheck, deleteNotification);
// router.get("/:id", changeConnectionStatus);
module.exports = router;
