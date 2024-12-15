// const mongoose = require("mongoose");

// const Schema = mongoose.Schema; //Schema là cấu trúc cho phép định nghĩa kiểu dữ liệu và các ràng buộc cho tài liệu (documents)

// const sessionSchema = new Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   token: {
//     type: String,
//     required: true,
//   },
//   isLoggedIn: {
//     type: Boolean,
//   },
//   expiresAt: {
//     type: Date, // Thời gian hết hạn của session
//     required: true,
//   },
// });
// module.exports = mongoose.model("Session", sessionSchema); //xuất mô hình ra để có thể sử dụng ở các tệp khác trong dự án
const mongoose = require("mongoose");

const Schema = mongoose.Schema; // Schema định nghĩa cấu trúc tài liệu (documents)

const sessionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date, // Thời gian hết hạn của session
    required: true,
  },
});

// Thêm index TTL (Time-To-Live) để tự động xóa tài liệu sau khi hết hạn
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
