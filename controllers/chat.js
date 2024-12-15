const ChatRoom = require("../models/chatRoom");


// Lấy tất cả các phòng chat
exports.getChatRooms = async (req, res, next) => {
  try {
    const rooms = await ChatRoom.find(); // Lấy tất cả các phòng chat
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
