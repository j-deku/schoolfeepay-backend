import express from "express";
import { body } from "express-validator";
import passport from 'passport'
import rateLimit from "express-rate-limit";
import {
  adminProfile,
  getAdminStats,
  loginAdmin,
  logout,
  protectAdminPanel,
  refreshToken,
  registerAdmin,
  resendOTP,
  verifyOTP,
} from "../controllers/AdminController";
import authAdmin from "../middlewares/adminAuth";
import authMiddleware from "../middlewares/auth";

const AdminRouter = express.Router();

// Rate limiting
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: "Too many OTP attempts. Please try again later.",
});

// Validation schemas
const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateOTP = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("otp").isNumeric().withMessage("Invalid OTP"),
];

// Routes
AdminRouter.get("/protect", authMiddleware, protectAdminPanel);
AdminRouter.post("/register", validateRegister, registerAdmin);
AdminRouter.post("/login", validateLogin, loginAdmin);
AdminRouter.post("/verify-otp", otpLimiter, validateOTP, verifyOTP);
AdminRouter.post("/resend-otp", otpLimiter, resendOTP);
AdminRouter.post("/refresh-token", refreshToken);

AdminRouter.use(authAdmin);
AdminRouter.get("/stats", getAdminStats);
AdminRouter.get("/me", adminProfile);
AdminRouter.post("/logout", logout);

export default AdminRouter;
