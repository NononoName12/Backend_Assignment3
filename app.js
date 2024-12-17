const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const Session = require("./models/Session");
const User = require("./models/user");
// const session = require("express-session");
// const MongoDBStore = require("connect-mongodb-session")(session);
// const csrf = require("csurf");

// const flash = require("connect-flash");
// const multer = require("multer");
const cors = require("cors");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
// const Product = require("../Server/models/product");
const http = require("http");
const socketIo = require("socket.io");
const ChatRoom = require("./models/chatRoom");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const app = express();

// Tạo một server HTTP và kết nối với ứng dụng Express (app)
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://assignment3-node-js.vercel.app",
      "https://assignment3-admin-node-js.vercel.app",
    ], // Client and Admin origins
    methods: ["GET", "POST"],
    credentials: true, // Nếu cần xác thực
  },
});

// Lưu danh sách các phòng chat đang hoạt động
let activeRooms = [];

//Hàm để load các phòng chat từ MongoDB khi server khởi động
const loadActiveRooms = async () => {
  try {
    const rooms = await ChatRoom.find({});
    activeRooms = rooms;
    // console.log("Loaded active rooms from MongoDB:", activeRooms);
  } catch (error) {
    console.error("Error loading active rooms from MongoDB:", error);
  }
};
loadActiveRooms();

// Xử lý sự kiện kết nối giữa client và server
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Khi client tham gia phòng
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);

    // Tìm phòng chat hoặc tạo mới nếu chưa tồn tại
    let room = await ChatRoom.findOne({ roomId });
    if (!room) {
      room = new ChatRoom({ roomId, messages: [] });
      await room.save();
      activeRooms.push(room);
      io.emit("activeRooms", activeRooms);
    } else {
      console.log("Room already exists, no need to add.");
      // Gửi danh sách phòng hoạt động tới admin
      io.emit("activeRooms", activeRooms);
    }

    // Gửi các tin nhắn cũ của phòng cho client
    socket.emit("loadMessages", room.messages);
  });

  // Lắng nghe tin nhắn từ client
  socket.on("chatMessage", async ({ roomId, sender, message }) => {
    const room = await ChatRoom.findOne({ roomId });

    if (room) {
      const newMessage = { sender, message, timestamp: new Date() };

      // Lưu tin nhắn vào MongoDB
      room.messages.push(newMessage);
      await room.save();

      // Gửi tin nhắn mới đến tất cả các thành viên trong phòng
      io.to(roomId).emit("message", newMessage);
    }
  });

  // Khi kết thúc chat
  socket.on("endChat", async ({ roomId }) => {
    // Xóa phòng chat khỏi cơ sở dữ liệu
    await ChatRoom.findOneAndDelete({ roomId }); // Xóa phòng chat khỏi MongoDB

    // Loại bỏ phòng khỏi danh sách activeRooms
    activeRooms = activeRooms.filter((room) => room.roomId !== roomId); // Loại bỏ phòng khỏi danh sách
    io.emit("activeRooms", activeRooms); // Cập nhật danh sách phòng cho admin

    socket.leave(roomId);
    // Phát sự kiện "end" chỉ cho client hiện tại
    socket.emit("end", "Chat has been ended."); // Gửi chỉ cho client kết thúc

    io.emit("endMess");
  });

  // Khi ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Middleware để phân tích JSON
app.use(bodyParser.json());
// Middleware để phân tích URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware để phân tích body của request
app.use(express.json()); // Để xử lý application/json
app.use(express.urlencoded({ extended: true })); // Để xử lý application/x-www-form-urlencoded
app.use(cookieParser());

const allowedOrigins = [
  "https://assignment3-node-js.vercel.app",
  "https://assignment3-admin-node-js.vercel.app", // URL frontend React
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        // Nếu không có origin (khi request từ server-side) hoặc origin hợp lệ
        callback(null, true);
      } else {
        // Nếu origin không hợp lệ
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cho phép gửi cookie và auth
  })
);

// Tạo thư mục uploads nếu chưa tồn tại
const fs = require("fs");
const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Middleware để phục vụ các file tĩnh
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(async (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {
    console.log("Không có token trong cookie.");
    return next(); // Nếu không có token trong cookie, tiếp tục đến middleware hoặc route tiếp theo
  }

  try {
    // Tìm token trong MongoDB (trong collection Session)
    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      console.log("Không tìm thấy token trong session.");
      return next(); // Nếu không tìm thấy token trong MongoDB, tiếp tục middleware khác
    }

    // Tìm thông tin người dùng từ session
    const user = await User.findById(session.userId);
    if (!user) {
      req.isLoggedIn = false;
      console.log("Không tìm thấy user.");
      return next(); // Nếu không tìm thấy user, tiếp tục middleware khác
    }

    req.user = user; // Gán thông tin user vào request
    req.isLoggedIn = true; // Gán thông tin trạng thái login vào request
    console.log("Xác thực thành công:", req.user);
    next(); // Tiếp tục route hoặc middleware tiếp theo
  } catch (err) {
    console.error("Lỗi server:", err);
    return next(); // Xử lý lỗi nhưng vẫn tiếp tục middleware khác
  }
});
// Cấu hình các route (đường dẫn) cho ứng dụng Express.js
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/", homeRoutes);

app.use((req, res, next) => {
  //Middleware xử lý lỗi không tìm thấy Router
  res.status(404).json({ message: "Route not found" });
});

//Kết nối đến cơ sở dữ liệu MongoDB bằng Mongoose
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connect");
    server.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
