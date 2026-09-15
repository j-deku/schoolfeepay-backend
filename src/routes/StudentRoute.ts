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

studentRouter.post("/auth/register", registerUser);
studentRouter.post("/auth/verify-otp", verifyOTP);
studentRouter.post("/auth/resend-otp", resendOTP);
studentRouter.post("/auth/login", loginUser);
studentRouter.post("/auth/refresh-token", refreshAccessToken);

studentRouter.get("/user/me", protect, userProfile);
studentRouter.patch("/user/update-profile", protect, updateUserProfile);
studentRouter.post("/user/logout", protect, logoutUser);


export default studentRouter;