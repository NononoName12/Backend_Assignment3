const path = require("path"); //Làm việc với đường dẫn file

const express = require("express"); // framework phổ biến của Node.js

const adminController = require("../controllers/admin");
const router = express.Router(); // tạo một đối tượng router từ express
const checkRole = require("../middleware/checkRole");
const auth = require("../middleware/auth");
const upload = require("../multerConfig"); // Nhập từ file cấu hình Multer

// / =>GET
router.get(
  "/",
  auth,
  checkRole(["admin", "consultant"]),
  adminController.getAdminStats
);

// / =>GET
router.get(
  "/products",
  auth,
  checkRole(["admin"]),
  adminController.getAdminProducts
);

// / =>GET
router.get(
  "/historys",
  auth,
  checkRole(["admin"]),
  adminController.getAdminHistorys
);

// / =>GET
router.get("/users", auth, checkRole(["admin"]), adminController.getAdminUsers);

// /admin/edit-user/:id => GET
router.get(
  "/edit-user/:id",
  auth,
  checkRole(["admin"]),
  adminController.getEditUser
);

// /edit-user =>UPDATE
router.put(
  "/edit-user/:id",
  auth,
  checkRole(["admin"]),
  adminController.updateEditUser
);

// /user =>DELETE
router.delete(
  "/delete-user/:id",
  auth,
  checkRole(["admin"]),
  adminController.deleteUser
);

// /products/pagination => GET
router.get(
  "/products/pagination",

  adminController.getPagination
);

// /users/pagination => GET
router.get(
  "/users/pagination",

  adminController.getPaginationUser
);

// /admin/add-product => GET
router.get(
  "/edit-product/:id",
  auth,
  checkRole(["admin"]),
  adminController.getEditProduct
);

// /edit-product =>UPDATE
router.put(
  "/edit-product/:id",
  auth,
  checkRole(["admin"]),
  upload.array("files"),
  adminController.updateEditProduct
);

// /admin/add-product => POST
router.post(
  "/add-product",
  auth,
  checkRole(["admin"]),
  upload.array("files"),
  adminController.postAddProduct
);

// /product =>DELETE
router.delete(
  "/product/:id",
  auth,
  checkRole(["admin"]),
  adminController.deleteProduct
);
module.exports = router;
