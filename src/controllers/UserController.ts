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
import User from "../models/UserModel";
// Create token
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const createAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};
// Register user
const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, studentId, institution} = req.body;

  try {
    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.json({ success: false, message: "User already exists" });
      return;
    }

    if(studentId < 8 || !validator.isNumeric(studentId)){
        res.json({success: false, message: "Invalid student ID. \n Please a valid student ID"})
        return;
    }

    // Validate email
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Invalid email format" });
      return;
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
      res.json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, and a special character.",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      studentId,
      institution,
      verified: false,
      role: "user",
    });

    const user = await newUser.save();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DB
    await OTPModel.create({ userId: user._id, otp, expiresAt });

    // Send verification email
    try {
      await sendEmail(user.email, "Email Verification", EmailOTP(user.name, otp));
    } catch (emailError) {
      //console.error("Error sending email:", emailError);
     
      await User.findByIdAndDelete(user._id);
      res.json({ success: false, message: "Failed to send verification email" });
      return;
    }

    res.json({
      success: true,
      message: "OTP sent to your email. Please verify to continue.",
      redirect: "/verify-otp",
      userId: user._id,
    });
  } catch (error) {
    //console.error("Register error:", error);
    res.json({ success: false, message: "Something went wrong. Please try again." });
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
      user.verified = true;
      user.role = "user";
      await user.save();
      await OTPModel.deleteOne({ userId });
      console.log("After update:", user.role);

      await sendEmail(user.email, "Successful Verification", VerifiedEmail(user.name));
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 
      const redirectUrl = `${FRONTEND_URL}/?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;

      const newToken = createAccessToken(user._id.toString(), user.role);
      setAppCookie(res, "usATK", newToken, {
        path:"/",
        maxAge:24 * 60 * 60 * 1000,
      })
      res.json({
        success: true,
        message: "Email verified successfully",
        redirect: redirectUrl,
        user:{ name: user.name, email: user.email },
      });
      return;
    }

    res.json({ success: false, message: "Invalid OTP" });
  } catch (error) {
    //console.error(error);
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

    if (user.verified) {
      res.json({ success: false, message: "User already verified" });
      return;
    }    

    const otp = generateOTP();
    const token = createAccessToken(user._id.toString(), user.role);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-otp?token=${token}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await sendEmail(
      user.email,
      "Email Verification - Resend",
      ResendEmail(user.name, otp, verificationUrl)
    );
    await OTPModel.updateOne({ userId: user._id }, { otp, expiresAt });

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    //console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { password, studentId } = req.body;

  try {
    const user = await User.findOne({ studentId });
    const selectedInstitution = await User.findOne({institution});

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account found with this student ID. \n Please register first.",
      });
      return;
    }

    // Google account check should come before bcrypt
    if (!user.password) {
      res.status(400).json({
        success: false,
        message: "This account was created using Google. Please use Google login.",
      });
      return;
    }

    if(studentId < 10 || !validator.isNumeric(studentId)){
        res.json({success: false, message: "Invalid student ID. \n Please a valid student ID"})
        return;
    }

    if(!selectedInstitution = ["gctu", "upsa", "knust", "winneba"]){
        res.json({success: true, message:"Match selected instutition."})
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid password for this account.",
      });
      return;
    }

    if (!user.verified) {
      res.status(403).json({
        success: false,
        message: "Please verify your email to continue.",
        redirect: "/verify-otp",
      });
      return;
    }

    const accessToken = createAccessToken(user._id.toString(), user.role);
    const refreshToken = createRefreshToken(user._id.toString());

    setAppCookie(res, "usATK", accessToken, {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    setAppCookie(res, "usRTK", refreshToken, {
      path: "/",
      maxAge: 72 * 60 * 60 * 1000,
    });

    // Respond immediately
    res.status(200).json({
      success: true,
      message: "Login Successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Send email in the background
    void sendEmail(email, "Welcome Back", EmailWelcome(user.name))
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

const userProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.usATK;

    if (!token) {
      res.status(200).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    // Decode JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    //console.error(error);
    res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const googleAuthCallback = async (req:Request, res:Response): Promise<void> => {
 /* try {
    console.log("Google Profile Data:", req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Google authentication failed",
      });
    }

    const { id: googleId, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value || null; 
    const name = displayName || "Google User"; 
    const avatar = photos?.[0]?.value || ""; 

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Required user information (email) is missing",
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        avatar,
        googleId,
        verified: true, 
      });
    }

    const token = createToken(user._id);
    await sendEmail(email, "Welcome Back 🌷", EmailWelcome(user.name));

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173"; 

    res.redirect(
      `${frontendURL}/?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(avatar)}`
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during Google authentication:", error.message);
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } */
};

// Google login failure
const googleAuthFailure = (req:Request, res:Response) => {
  res.status(401).json({
    success: false,
    message: "Failed to authenticate with Google",
  });
  //console.error("Google authentication failed:", req.query.error);
  // Redirect to login page with error message
  res.redirect(process.env.FRONTEND_URL + "/?error=google_auth_failed");
};

const refreshToken = async (req: Request, res: Response):Promise<void> => {
  try {
    const token = req.cookies.usRTK;

    if (!token){
      res.status(401).json({ message: "Unauthorized" });
      return;
    };

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string, role: string };

    const user = await User.findById(decoded.id);

if (!user) {
  res.status(401).json({
    success: false,
    message: "User not found",
  });
  return;
}

  const accessToken = createAccessToken(
    user._id.toString(),
    user.role
  );

    setAppCookie(res, "usATK", accessToken, {
      path: "/",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.json({ success: true });

  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logoutUser = (req: Request, res: Response) => {
  const user = req.cookies.usATK;
  if(user){
  res.clearCookie("usATK");
  res.clearCookie("usRTK");
}
  res.json({
    success: true,
    message: "Logged out successfully",
    redirect: "/"
  });
};


const dashboardStats = () =>{
  
};

export { registerUser, verifyOTP, resendOTP, loginUser,  userProfile, googleAuthCallback, googleAuthFailure, refreshToken, logoutUser, dashboardStats};