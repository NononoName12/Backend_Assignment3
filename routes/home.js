const path = require("path");

const express = require("express");

const homeController = require("../controllers/home");
const authMiddleware = require("../middleware/auth"); // Đường dẫn đến file middleware
const router = express.Router();
const { check, validationResult } = require("express-validator"); // xác thực dữ liệu đầu vào (input validation) trong ứng dụng Express
const checkRole = require("../middleware/checkRole");
const auth = require("../middleware/auth");

// / =>GET
router.get("/", homeController.getIndex);

// /detail =>GET
router.get("/detail/:id", homeController.getDetail);

// /cart => GET
router.get(
  "/cart",
  // auth,
  // checkRole(["customer", "consultant", "admin"]),
  homeController.getCart
);

// /cart => POST
router.post(
  "/cart",
  auth,
  checkRole(["customer", "consultant", "admin"]),
  homeController.postCart
);

// /cart/remove => POST
router.post(
  "/cart/remove",
  auth,
  checkRole(["customer", "consultant", "admin"]),
  homeController.postCartRemove
);

// /cart/update => PUT
router.put(
  "/cart/update",
  auth,
  checkRole(["customer", "consultant", "admin"]),
  homeController.updateCart
);

// /checkout => POST
router.post(
  "/checkout",
  auth,
  [
    // Validate các trường trong object customer
    check("customer.name")
      .notEmpty()
      .withMessage("Fullname is required")
      .isLength({ min: 3 })
      .withMessage("Fullname must be at least 3 characters long"),
    check("customer.email").isEmail().withMessage("Invalid email format"),
    check("customer.phone")
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Phone must be 10 or 11 digits"),
    check("customer.address")
      .notEmpty()
      .withMessage("Address is required")
      .isLength({ min: 5 })
      .withMessage("Address must be at least 5 characters long"),
  ],
  checkRole(["customer", "consultant", "admin"]),
  homeController.postCheckout
);

// /products/pagination => GET
router.get("/products/pagination", homeController.getPagination);

// /orders => GET
router.get(
  "/orders",
  auth,
  checkRole(["customer", "consultant", "admin"]),
  homeController.getOrders
);

// /orders/:id => GET
router.get(
  "/orders/:id",
  auth,
  checkRole(["customer", "consultant", "admin"]),
  homeController.getOrdersDetail
);

module.exports = router;
