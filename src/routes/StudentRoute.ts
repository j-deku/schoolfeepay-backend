import { Router } from "express";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  userProfile,
  updateUserProfile,
  refreshAccessToken,
  logoutUser,
} from "../controllers/UserController";
import { protect } from "../middlewares/auth";

const studentRouter = Router();

studentRouter.post("/register", registerUser);
studentRouter.post("/verify-otp", verifyOTP);
studentRouter.post("/resend-otp", resendOTP);
studentRouter.post("/login", loginUser);
studentRouter.post("/logout", logoutUser);
studentRouter.post("/refresh-token", refreshAccessToken);

studentRouter.get("/profile", protect, userProfile);
studentRouter.patch("/profile", protect, updateUserProfile);

export default studentRouter;