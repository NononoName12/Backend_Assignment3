const mongoose = require("mongoose");

const Schema = mongoose.Schema; //Schema là cấu trúc cho phép định nghĩa kiểu dữ liệu và các ràng buộc cho tài liệu (documents)

const productSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    // images: {
    //   type: [String], // Mảng chứa các đường dẫn ảnh
    //   required: true,
    // },
    img1: {
      type: String,
    },
    img2: {
      type: String,
    },
    img3: {
      type: String,
    },
    img4: {
      type: String,
    },
    img5: {
      type: String,
    },
    long_desc: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    short_desc: {
      type: String,
    },
    countInStock: { type: Number, required: true, default: 10 },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);
module.exports = mongoose.model("Product", productSchema); //xuất mô hình ra để có thể sử dụng ở các tệp khác trong dự án
