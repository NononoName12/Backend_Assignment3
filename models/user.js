const mongoose = require("mongoose");
const Schema = mongoose.Schema; //Schema là cấu trúc cho phép định nghĩa kiểu dữ liệu và các ràng buộc cho tài liệu (documents)

// Tạo schema cho người dùng
const userSchema = new Schema(
  {
    fullName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "consultant", "admin"],
      default: "customer",
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true }
); // Tự động thêm trường `createdAt` và `updatedAt`

userSchema.methods.addToCart = async function (product, inputQuantity) {
  // Kiểm tra số lượng sản phẩm còn trong kho
  if (product.countInStock < inputQuantity) {
    throw new Error("Not enough stock available");
  }

  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = inputQuantity;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    // Nếu sản phẩm đã có trong giỏ hàng, cập nhật lại số lượng
    newQuantity = this.cart.items[cartProductIndex].quantity + inputQuantity;

    // Kiểm tra lại xem tổng số lượng sau khi thêm có vượt quá kho hay không
    if (product.countInStock < newQuantity) {
      throw new Error("Not enough stock available");
    }

    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
    updatedCartItems.push({
      productId: product._id,
      quantity: inputQuantity,
    });
  }

  // Cập nhật lại giỏ hàng của user
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;

  // Lưu lại thay đổi vào DB
  await product.save();
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

// Tạo mô hình từ schema
const User = mongoose.model("User", userSchema);

module.exports = User; //xuất mô hình ra để có thể sử dụng ở các tệp khác trong dự án
