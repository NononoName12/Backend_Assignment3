// multerConfig.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sử dụng path.join để tạo đường dẫn đầy đủ đến thư mục lưu file
    const uploadPath = path.join(__dirname, "uploads");
    cb(null, uploadPath); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    // Sử dụng Date.now() và tên file gốc
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix); // Tên file lưu
  },
});

// Tạo instance multer
// const upload = multer({ storage, limits: { files: 5 } });
const upload = multer({ storage });

// Xuất upload để sử dụng ở nơi khác
module.exports = upload;
