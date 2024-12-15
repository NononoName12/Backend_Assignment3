const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const path = require("path");
const mongoose = require("mongoose");

//Lấy thông tin thống kê
exports.getAdminStats = async (req, res, next) => {
  try {
    // Đếm số lượng đơn hàng
    const ordersCount = await Order.countDocuments();

    // Đếm số lượng người dùng
    const usersCount = await User.countDocuments();

    const orders = await Order.find(); // Dùng populate nếu cần lấy thông tin user
    res.status(200).json({
      orders,
      user: req.session.user,
      ordersCount,
      usersCount,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách thống kê." });
  }
};

//Lấy thông tin tất cả product
exports.getAdminProducts = async (req, res, next) => {
  try {
    const product = await Product.find(); // Dùng populate nếu cần lấy thông tin user
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách sản phẩm." });
  }
};

//Lấy thông tin tất cả user
exports.getAdminUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách user." });
  }
};

//Lấy thông tin user cần edit
exports.getEditUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id); //Tìm user chứa id truyền lên từ client

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Update User
exports.updateEditUser = async (req, res, next) => {
  const userId = req.params.id; // Lấy userId từ URL params
  const { fullName, email, phone, role } = req.body; // Lấy dữ liệu từ form client gửi lên
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phone,
        role,
      },
      { new: true, runValidators: true } // Tùy chọn để trả về dữ liệu mới sau khi cập nhật và kiểm tra validate
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      product: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete user
exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id; // Lấy ID từ URL params

  try {
    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Tìm và xóa user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Lấy thông tin tất cả đơn hàng
exports.getAdminHistorys = async (req, res, next) => {
  try {
    const order = await Order.find();
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách đơn hàng." });
  }
};

// Lấy thông tin số trang để phân trang product
exports.getPagination = async (req, res, next) => {
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Thoát tất cả các ký tự đặc biệt
  }
  try {
    const { page, count, search = "", category = "" } = req.query;

    const escapedInput = escapeRegex(search); // Escape các ký tự đặc biệt

    // Tạo biểu thức chính quy từ chuỗi đã escape
    const regex = new RegExp(escapedInput, "i");

    // Điều kiện tìm kiếm sản phẩm
    let filter = {};
    if (category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: regex }; // Sử dụng regex đã escape để tìm theo tên sản phẩm
    }

    // Lấy tổng số sản phẩm
    const totalProducts = await Product.countDocuments(filter);

    // Tìm sản phẩm theo phân trang
    const products = await Product.find(filter)
      .skip((page - 1) * count) // Bỏ qua các sản phẩm của trang trước
      .limit(parseInt(count)); // Lấy số lượng sản phẩm của trang hiện tại

    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / count), //Math.ceil(): Hàm này làm tròn lên đến số nguyên gần nhất
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error });
  }
};

// Lấy thông tin số trang để phân trang user
exports.getPaginationUser = async (req, res, next) => {
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Thoát tất cả các ký tự đặc biệt
  }
  try {
    const { page, count, search = "" } = req.query;

    const escapedInput = escapeRegex(search); // Escape các ký tự đặc biệt

    // Tạo biểu thức chính quy từ chuỗi đã escape
    const regex = new RegExp(escapedInput, "i");

    // Điều kiện tìm kiếm sản phẩm
    let filter = {};
    if (search) {
      filter.fullName = { $regex: regex }; // Sử dụng regex đã escape để tìm theo tên sản phẩm
    }

    // Lấy tổng số user
    const totalUsers = await User.countDocuments(filter);

    // Tìm user theo phân trang
    const users = await User.find(filter)
      .skip((page - 1) * count) // Bỏ qua các user của trang trước
      .limit(parseInt(count)); // Lấy số lượng user của trang hiện tại

    res.status(200).json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / count), //Math.ceil(): Hàm này làm tròn lên đến số nguyên gần nhất
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error });
  }
};

//Thêm 1 sản phẩm
exports.postAddProduct = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const files = req.files;

  // Kiểm tra số lượng ảnh
  if (files.length > 5) {
    return res
      .status(400)
      .json({ message: "You can only upload up to 5 images" });
  }

  // Gán đường dẫn ảnh vào các trường img1, img2,... img5
  const productImages = {};

  if (files[0])
    productImages.img1 = files[0].path.replace(
      /^.*[\\\/]uploads[\\\/]/,
      "http://localhost:5000/uploads/"
    );
  if (files[1])
    productImages.img2 = files[1].path.replace(
      /^.*[\\\/]uploads[\\\/]/,
      "http://localhost:5000/uploads/"
    );
  if (files[2])
    productImages.img3 = files[2].path.replace(
      /^.*[\\\/]uploads[\\\/]/,
      "http://localhost:5000/uploads/"
    );
  if (files[3])
    productImages.img4 = files[3].path.replace(
      /^.*[\\\/]uploads[\\\/]/,
      "http://localhost:5000/uploads/"
    );
  if (files[4])
    productImages.img5 = files[4].path.replace(
      /^.*[\\\/]uploads[\\\/]/,
      "http://localhost:5000/uploads/"
    );

  try {
    // Tạo mới sản phẩm với các thông tin được gửi lên từ client
    const newProduct = new Product({
      ...productImages, // Trường ảnh img1, img2, img3, img4, img5
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      long_desc: req.body.long_desc,
      short_desc: req.body.short_desc,
      countInStock: req.body.countInStock,
    });

    console.log(newProduct, "Product ADD file");

    await newProduct.save();

    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi!", error });
  }
};

//Lấy thông tin sản phẩm cần edit
exports.getEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Update sản phẩm
exports.updateEditProduct = async (req, res, next) => {
  const productId = req.params.id; // Lấy productId từ URL params
  const { name, category, price, long_desc, short_desc } = req.body; // Lấy dữ liệu từ form client gửi lên

  try {
    console.log("Product ID:", productId);
    console.log("Request body:", name, category, price, long_desc, short_desc);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        category,
        price,
        long_desc,
        short_desc,
        // images: "uploads/1728305968255-boat.png",
      },
      { new: true, runValidators: true } // Tùy chọn để trả về dữ liệu mới sau khi cập nhật và kiểm tra validate
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id; // Lấy ID từ URL params

  try {
    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Tìm và xóa sản phẩm
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
