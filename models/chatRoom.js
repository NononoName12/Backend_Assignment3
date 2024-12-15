// Model cho các Room chat
const mongoose = require("mongoose"); // thư viện giúp làm việc với MongoDB trong Node.js dễ dàng hơn

const Schema = mongoose.Schema;//Schema là cấu trúc cho phép định nghĩa kiểu dữ liệu và các ràng buộc cho tài liệu (documents)

//Định nghĩa một Schema cho các phòng chat
const chatRoom = new mongoose.Schema({
  roomId: String,
  messages: [{ sender: String, message: String, timestamp: Date }],
});

module.exports = mongoose.model("ChatRoom", chatRoom); //xuất mô hình ra để có thể sử dụng ở các tệp khác trong dự án
