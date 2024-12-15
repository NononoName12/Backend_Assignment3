const mongoose = require("mongoose");

const Schema = mongoose.Schema; //Schema là cấu trúc cho phép định nghĩa kiểu dữ liệu và các ràng buộc cho tài liệu (documents)

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tham chiếu đến mô hình User
        required: true, // Có thể cần bắt buộc, tùy thuộc vào yêu cầu của bạn
      },
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Tham chiếu đến mô hình Product
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // Thêm các trường createdAt và updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema); //xuất mô hình ra để có thể sử dụng ở các tệp khác trong dự án
