const path = require("path");
const express = require("express");
const { check, validationResult } = require("express-validator"); // xác thực dữ liệu đầu vào (input validation) trong ứng dụng Express
const router = express.Router(); //tạo một đối tượng router từ express
const authController = require("../controllers/auth");

// /auth/signup => GET
router.get("/signup", authController.getSignup);

// /auth/signin => POST
router.post(
  "/signin",
  [
    // Validate dữ liệu đăng nhập
    check("email").isEmail().withMessage("Invalid email"),
    check("password")
      .notEmpty()
      .withMessage("Password cannot be blank")
      .isLength({ min: 6 })
      .withMessage("Password must have at least 6 characters"),
  ],
  authController.postSignin
);

// /auth/signup => POST
router.post(
  "/signup",
  [
    check("fullName").trim().notEmpty().withMessage("Full name is required"),
    check("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must have at least 6 characters"),
    check("phone").isMobilePhone().withMessage("Invalid phone number"),
  ],
  authController.postSignup
);

// /auth/logout => POST
router.post("/logout", authController.postLogout);

module.exports = router;
