import express from "express";
import { body } from "express-validator";
import passport from 'passport'
import rateLimit from "express-rate-limit";
import {
  loginUser,
  registerUser,
  resendOTP,
  verifyOTP,
  googleAuthCallback,
  userProfile,
  refreshToken,
  logoutUser,
} from "../controllers/UserController";
import authMiddleware from "../middlewares/auth";

const StudentRouter = express.Router();

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
StudentRouter.post("/register", validateRegister, registerUser);
StudentRouter.post("/login", validateLogin, loginUser);
StudentRouter.post("/verify-otp", otpLimiter, validateOTP, verifyOTP);
StudentRouter.post("/resend-otp", otpLimiter, resendOTP);
StudentRouter.post("/refresh-token", refreshToken);

StudentRouter.use(authMiddleware);
StudentRouter.get("/me", userProfile);
StudentRouter.post("/logout", logoutUser);

// Google OAuth routes
StudentRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

StudentRouter.get("/google/callback",passport.authenticate("google", {
    failureRedirect: "/api/user/google/failure",
  }),
  googleAuthCallback
);
export default StudentRouter;
