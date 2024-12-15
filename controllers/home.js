const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_PASS = process.env.SECRET_PASS;

// Tạo 1 hàm gửi email tự động dùng nodemailer, Cấu hình SMTP với Gmail:
async function sendMail(customer, productList, totalPrice) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nguyenphucbao25507@gmail.com", // Thay bằng email của bạn
        pass: SECRET_PASS, // Thay bằng App Password 16 ký tự
      },
    });

    // Cấu hình email
    const mailOptions = {
      from: "Admin <nguyenphucbao25507@gmail.com>",
      to: customer.email,
      subject: "Xác Nhận Đơn Hàng",
      html: `
        <h1>Xin chào ${customer.name}</h1>
        <p>Phone: ${customer.phone}</p>
        <p>Address: ${customer.address}</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 10px;">Tên Sản Phẩm</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Hình Ảnh</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Giá</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Số Lượng</th>
          <th style="border: 1px solid #ddd; padding: 10px;">Thành Tiền</th>
        </tr>
      </thead>
      <tbody>
        ${productList
          .map(
            (product) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">${
              product.productId.name
            }</td>
            <td style="border: 1px solid #ddd; padding: 10px;"><img src="${
              product.productId.img1
            }" alt="${product.name}" style="width: 50px; height: auto;"></td>
            <td style="border: 1px solid #ddd; padding: 10px;">${product.productId.price.toLocaleString(
              "vi-VN"
            )} VNĐ</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${
              product.quantity
            }</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${(
              product.productId.price * product.quantity
            ).toLocaleString("vi-VN")} VNĐ</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
        <div style="margin-top: 20px;">
          <h2 style=" margin: 0; padding: 0; display: block;">Tổng thanh toán:</h2>
          <h2 style=" margin: 0; padding: 0; display: block;">${totalPrice.toLocaleString(
            "vi-VN"
          )} VNĐ</h2>
        </div>
        <div style="margin-top: 20px;">
          <h2 style=" margin: 0; padding: 0; display: block;">Cảm ơn bạn!</h2>
        </div>
      `,
    };

    // Gửi email
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent...", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Lấy thông tin tất cả sản phẩm
exports.getIndex = (req, res, next) => {
  // console.log(req.session.user, "User");
  Product.find()
    .then((products) => {
      res.json({
        prods: products,
        pageTitle: "Product",
        path: "/",
        user: req.user,
        isLoggedIn: req.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Phân trang
exports.getPagination = async (req, res, next) => {
  try {
    const { page, count, search = "", category = "" } = req.query;

    // Điều kiện tìm kiếm sản phẩm
    let filter = {};
    if (category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Tìm theo tên sản phẩm (không phân biệt chữ hoa/thường)
    }

    // Lấy tổng số sản phẩm
    const totalProducts = await Product.countDocuments(filter);

    // Tìm sản phẩm theo phân trang
    const products = await Product.find(filter)
      .skip((page - 1) * count) // Bỏ qua các sản phẩm của trang trước
      .limit(parseInt(count)); // Lấy số lượng sản phẩm của trang hiện tại

    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / count),
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Trả về thông tin chi tiết 1 sản phẩm dựa trên id truyền từ client
exports.getDetail = (req, res, next) => {
  const productId = req.params.id;
  Product.findById(productId)
    .then((products) => {
      res.json({
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Trả về thông tin cart của user hiện tại
exports.getCart = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // Kiểm tra xem user có đăng nhập không
    }

    // Sử dụng trực tiếp `populate()` mà không cần `execPopulate()`
    const userWithCart = await req.user.populate("cart.items.productId");

    const cartProducts = userWithCart.cart.items;
    console.log(cartProducts, "cartProducts");

    res.json({
      pageTitle: "Your Cart",
      cartProducts: cartProducts,
      path: "/cart",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Trả về đơn hàng dựa vào email truyền lên
exports.getOrders = async (req, res, next) => {
  const email = req.query.email; // Nhận email từ query string

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const orders = await Order.find({ "customer.email": email });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách đơn hàng." });
  }
};

// Trả về thông tin chi tiết của 1 đơn hàng
exports.getOrdersDetail = async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId).populate("products.productId"); // Lấy thông tin sản phẩm

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy thông tin đơn hàng." });
  }
};

// Thêm 1 cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const inputQuantity = req.body.inputQuantity;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product, inputQuantity); // Gọi hàm addToCart và truyền vào sản phẩm và số lượng
    })
    .then((result) => {
      res.json({
        message: "Sucess",
      });
    })
    .catch((err) => {
      // Bắt lỗi và trả về client
      res.status(400).json({ message: err.message });
    });
};

// Xóa 1 cart dựa trên idUser và idProduct
exports.postCartRemove = async (req, res, next) => {
  const { userId, productId } = req.body;

  try {
    // Tìm người dùng theo userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tìm chỉ số sản phẩm trong giỏ hàng
    const productIndex = user.cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    user.cart.items.splice(productIndex, 1);

    // Lưu lại thông tin người dùng
    await user.save();

    return res
      .status(200)
      .json({ message: "Product removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật 1 cart dựa trên idUser và giỏ hàng truyền lên từ client
exports.updateCart = async (req, res, next) => {
  const { userId, cartItems } = req.body;
  let errorMessage;

  try {
    // Tìm người dùng theo userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const products = await Product.find({
      _id: { $in: cartItems.map((item) => item.productId) },
    });

    // Cập nhật giỏ hàng
    const updatedCartItems = cartItems.map((item) => {
      const product = products.find(
        (prod) => prod._id.toString() === item.productId.toString()
      );

      if (!product) {
        console.error(`Product not found for ID: ${item.productId}`);
        return null; // Trả về null nếu sản phẩm không tồn tại
      }

      // Kiểm tra số lượng còn lại trong kho
      if (product.countInStock < item.quantity) {
        errorMessage = "Not enough stock available"; // Ghi nhận lỗi nếu không đủ hàng
      }

      const cartItemIndex = user.cart.items.findIndex(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString()
      );

      if (cartItemIndex >= 0) {
        // Cập nhật số lượng
        user.cart.items[cartItemIndex].quantity = item.quantity;

        // Trả về sản phẩm đã cập nhật
        return user.cart.items[cartItemIndex];
      }
    });

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    user.cart.items = updatedCartItems;
    await user.save();

    res
      .status(200)
      .json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Nhận form data checkout từ client để thêm vào 1 đơn hàng
exports.postCheckout = async (req, res, next) => {
  try {
    const { customer, products, totalPrice } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        path: "/checkout",
        pageTitle: "Checkout",
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    // Tìm user dựa vào email
    const checkUser = await User.findOne({ email: customer.email });
    if (!checkUser) {
      return res
        .status(404)
        .json({ errorMessage: "No user found with this email." });
    }

    // Lấy userId từ user model
    const userId = checkUser._id;

    // Tạo một đơn hàng mới
    const newOrder = new Order({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        userId,
      },
      products: products.map((item) => ({
        productId: item.productId,
        // name: item.name,
        quantity: item.quantity,
        // price: item.price,
      })),
      totalPrice: totalPrice,
      status: "Pending", // Đặt trạng thái mặc định là "Pending"
    });

    // Lưu đơn hàng vào MongoDB
    const savedOrder = await newOrder.save();

    // Lấy thông tin người dùng từ req.user (giả sử người dùng đã được xác thực và lưu trong req.user)
    const user = req.user; // Có thể lấy thông tin người dùng từ req.user

    // Xóa giỏ hàng của người dùng
    await user.clearCart();

    sendMail(customer, products, totalPrice);

    // Cập nhật số lượng sản phẩm trong kho
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.countInStock -= item.quantity; // Giảm số lượng trong kho
        await product.save(); // Lưu thay đổi
      }
    }

    // Trả về phản hồi thành công
    res.status(201).json({
      message: "Order has been placed successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({
      errorMessage: "An error occurred while placing the order.",
    });
  }
};
