const Session = require("../models/Session");
const User = require("../models/user");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const authMiddleware = async (req, res, next) => {
  if (req && req.user) {
    // Nếu có session và có thông tin người dùng
    next(); // Cho phép tiếp tục đến route tiếp theo
  } else {
    // Nếu không có session hoặc không có thông tin người dùng
    res.status(401).json({ message: "Unauthorized: Please log in first." });
  }
  // try {

  // const SECRET_KEY = process.env.SECRET_KEY;

  // const token = req.cookies.token;

  // if (!token) {
  //   return res.status(401).json({ message: "Authentication failed." });
  // }

  // // Kiểm tra và giải mã token
  // jwt.verify(token, SECRET_KEY, (err, decoded) => {
  //   if (err) {
  //     return res.status(401).json({ message: "Invalid token." });
  //   }

  //   // Lấy thông tin người dùng từ token và gán vào req.user
  //   User.findById(decoded.userId)
  //     .then((user) => {
  //       if (!user) {
  //         return res.status(401).json({ message: "User not found." });
  //       }
  //       req.user = user; // Gán người dùng vào request
  //       console.log(req.user, "req.user");
  //       next(); // Tiếp tục thực hiện request
  //     })
  //     .catch((err) => {
  //       return res.status(500).json({ message: "Server error." });
  //     });
  // });
};

module.exports = authMiddleware;
