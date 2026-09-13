import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import OTPModel from "../models/OTPModel";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";
import {
  EmailOTP,
  EmailWelcome,
  ResendEmail,
  VerifiedEmail,
} from "../utils/EmailTemplates";
import { Request, Response } from "express";
import { setAppCookie } from "../utils/CookieHelper";
import {User} from "../models/UserModel";
// Create token
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const createAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "1m",
  });
};

export const createRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};
// Register user
const registerAdmin = async (req:Request, res:Response): Promise<void> => {
  const { name, password, email } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      res.json({ success: false, message: "User already exists" });
      return;
    }

    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Invalid email format" });
      return;
    }

    if (!validator.isStrongPassword(password)) {
      res.json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, and a special character.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verified: false,
    });

    const user = await newUser.save();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await sendEmail(
        user.email,
        "Email Verification",
        EmailOTP(user.firstName, otp)
      );
      await OTPModel.create({ userId: user._id, otp, expiresAt });
      res.json({
        success: true,
        message: "OTP sent to your email",
        redirect: "/verify-otp",
        userId: user._id,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      await User.findByIdAndDelete(user._id);
      res.json({ success: false, message: "Failed to send email" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

// Verify OTP
const verifyOTP = async (req:Request, res:Response): Promise<void> => {
  const { userId, otp, token } = req.body;
  try {
    let user;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      user = await User.findById(decoded.id);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    if (token || (await OTPModel.findOne({ userId:user._id, otp }))) {
      user.emailVerified = true;
      user.role = "admin";
      await user.save();
      await OTPModel.deleteOne({ userId });
      console.log("After update:", user.role);

      await sendEmail(user.email, "Successful Verification", VerifiedEmail(user.firstName));
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 
      const redirectUrl = `${FRONTEND_URL}/?name=${encodeURIComponent(user.firstName)}&email=${encodeURIComponent(user.email)}`;
      
      const newAccessToken = createAccessToken(user._id.toString());

      setAppCookie(res, "AdATK", newAccessToken, {
        path: "/",
        maxAge: 20 * 60 * 1000
      });
      
      res.json({
        success: true,
        message: "Email verified successfully",
        redirect: redirectUrl,
        user:{ name: user.firstName, email: user.email },
      });
      return;
    }

    res.json({ success: false, message: "Invalid OTP" });
  } catch (error) {
   // console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

// Resend OTP
const resendOTP = async (req:Request, res:Response): Promise<void> => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: false, message: "User already verified" });
      return;
    }

    const otp = generateOTP();
    const token = createAccessToken(user._id.toString());
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-otp?token=${token}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await sendEmail(
      user.email,
      "Email Verification - Resend",
      ResendEmail(user.firstName, otp)
    );
    await OTPModel.updateOne({ userId: user._id }, { otp, expiresAt });

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    //console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

const loginAdmin = async (req:Request, res:Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account found with this email. \n Please contact the super admin",
      });
      return;
    }
    if(user.role!=="admin") {
      res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource. \n Please login with an admin account.",
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message: "Please verify your email to continue.",
        redirect: "/verify-otp",
      });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        success: false,
        message: "This admin account was created using Google. Please use Google login.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "You entered invalid password for this account.",
      });
      return;
    } 

    const AccessToken = createAccessToken(user._id.toString());

    setAppCookie(res, "AdATK", AccessToken, {
      path: "/",
      maxAge: 1 * 60 * 1000, 
    });
  const refreshToken = createRefreshToken(user._id.toString());

  setAppCookie(res, "AdRTK", refreshToken, {
    path: "/",
    maxAge: 72 * 60 * 60 * 1000,
  });
    res.status(200).json({
      success: true,
      message: "Login Successful!"
    });

        // Send email in the background
    void sendEmail(email, `Welcome Back, ${user.role}`, EmailWelcome(user.firstName))
      .catch((err) => {
        //console.error("Failed to send welcome email:", err);
      });
  } catch (error) {
    //console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const adminRoleCheck = async (req:Request, res:Response) =>{
  try {
    const token = req.cookies?.usATK;
    if(!token){
      res.status(200).json({message:"User not authenticated", success: false});
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string, role: string };

    const user = decoded;
    if(user.role == "admin"){
      const accessToken = createAccessToken(decoded.id);
      setAppCookie(res, "AdATK", accessToken); 
    }else{
      res.status(200).json({message:"User not authorized", success: false});      
    }

  } catch (error) {
    res.status(500).json({success: false, message:"Server down at this moment."})
  }
}
const adminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.AdATK;

    if (!token) {
      res.status(200).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    const admin = await User.findById(decoded.id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User authenticated",
      admin,
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const refreshToken = async (req: Request, res: Response):Promise<void> => {
  try {
    const token = req.cookies.AdRTK;

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return 
    } 

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string, role: string};

    const accessToken = createAccessToken(decoded.id);

    setAppCookie(res, "AdATK", accessToken);

    res.json({ success: true });

  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = (req: Request, res: Response) => {
  const admin = req.cookies.AdATK;
  if(admin){
  res.clearCookie("AdATK");
  res.clearCookie("AdRTK");
}
  res.json({
    success: true,
    message: "Logged out",
    redirect: "/admin/"
  });
};

const protectAdminPanel = (req:Request, res:Response):void => {
    const userRole = req.body.role;

    if (userRole !== "admin") {
        res.status(200).json({
            success: false,
            canLogin: false,
            message: "Only administrators can access this page."
        });
        return;
    }

    res.json({
        success: true,
        role: userRole,
        canLogin: true,
    });
};



const getAdminStats = () =>{

};

export { registerAdmin, verifyOTP, resendOTP, loginAdmin, adminProfile, refreshToken, logout, protectAdminPanel, adminRoleCheck, getAdminStats};