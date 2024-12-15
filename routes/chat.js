const express = require("express");

const chatController = require("../controllers/chat");
const router = express.Router(); //Tạo một đối tượng router từ express
const checkRole = require("../middleware/checkRole");
const auth = require("../middleware/auth");

// / =>GET
router.get(
  "/chatrooms",
  auth,
  checkRole(["admin", "consultant"]),
  chatController.getChatRooms
);

module.exports = router;
