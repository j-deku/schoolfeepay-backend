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
import { StudentProfile } from "../models/StudentProfileModel";
import mongoose from "mongoose";
import { User } from "../models/UserModel";

// Create token
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not defined");

export const createAccessToken = (
  id: string,
  role: string
) => {
  return jwt.sign(
    {
      id,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const createRefreshToken = (
  id: string
) => {
  return jwt.sign(
    {
      id,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {

  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      studentId,
      institutionId,
      programmeId,
      facultyId,
      level,
    } = req.body;

    // Validation happens here...

    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedStudentId =
      studentId.trim().toUpperCase();

    // Check duplicates

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      }).session(session);

    if (existingUser) {

      await session.abortTransaction();

      res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });

      return;
    }

    // Create user

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const users =
      await User.create(
        [
          {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            role: "student",
            emailVerified: false,
            isActive: true,
          },
        ],
        { session }
      );

    const user = users[0];

    if (!user) {
      throw new Error(
        "Failed to create user account."
      );
    }

    // Create Student Profile

    await StudentProfile.create(
      [
        {
          user: user._id,
          institution: institutionId,
          studentId: normalizedStudentId,
          faculty: facultyId || undefined,
          programme: programmeId || undefined,
          currentLevel: level || undefined,
          status: "active",
        },
      ],
      { session }
    );

    // Commit

    await session.commitTransaction();

    // OTP AFTER DATABASE TRANSACTION

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000
    );

    await OTPModel.deleteMany({
      userId: user._id,
    });

    await OTPModel.create({
      userId: user._id,
      otp,
      expiresAt,
    });

    // Send Email

    await sendEmail(
      user.email,
      "Verify Your UniPay Ghana Account",
      EmailOTP(
        `${user.firstName} ${user.lastName}`,
        otp
      )
    );

    res.status(201).json({
      success: true,

      message:
        "Registration successful. Please check your email for the verification code.",

      userId: user._id,

      redirect: "/verify-otp",
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Unable to complete registration. Please try again.",
    });

  } finally {

    session.endSession();

  }
};

const verifyOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    // ==============================
    // VALIDATE REQUEST
    // ==============================

    if (!userId || !otp) {
      res.status(400).json({
        success: false,
        message: "User ID and verification code are required.",
      });

      return;
    }

    if (!/^\d{6}$/.test(String(otp))) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit verification code.",
      });

      return;
    }

    // ==============================
    // FIND USER
    // ==============================

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });

      return;
    }

    // ==============================
    // ALREADY VERIFIED
    // ==============================

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: "This email address has already been verified.",
      });

      return;
    }

    // ==============================
    // FIND OTP
    // ==============================

    const otpRecord = await OTPModel.findOne({
      userId: user._id,
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message:
          "No active verification code was found. Please request a new code.",
      });

      return;
    }

    // ==============================
    // CHECK EXPIRATION
    // ==============================

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await OTPModel.deleteOne({
        _id: otpRecord._id,
      });

      res.status(400).json({
        success: false,
        message:
          "This verification code has expired. Please request a new code.",
      });

      return;
    }

    // ==============================
    // VERIFY OTP
    // ==============================

    if (otpRecord.otp !== String(otp)) {
      res.status(400).json({
        success: false,
        message: "The verification code is incorrect.",
      });

      return;
    }

    // ==============================
    // VERIFY USER
    // ==============================

    user.emailVerified = true;

    await user.save();

    // ==============================
    // REMOVE USED OTP
    // ==============================

    await OTPModel.deleteOne({
      _id: otpRecord._id,
    });

    // ==============================
    // SEND CONFIRMATION EMAIL
    // ==============================

    void sendEmail(
      user.email,
      "Email Verified Successfully",
      VerifiedEmail(
        `${user.firstName} ${user.lastName}`
      )
    ).catch((error) => {
      console.error(
        "Verification confirmation email error:",
        error
      );
    });

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now log in to your account.",

      redirect: "/login",

      user: {
        id: user._id,

        firstName: user.firstName,

        lastName: user.lastName,

        fullName:
          `${user.firstName} ${user.lastName}`,

        email: user.email,

        role: user.role,
      },
    });

  } catch (error) {

    console.error(
      "OTP verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to verify your email at this time. Please try again.",
    });
  }
};

const resendOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    // ==============================
    // VALIDATE REQUEST
    // ==============================

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required.",
      });

      return;
    }

    // ==============================
    // FIND USER
    // ==============================

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });

      return;
    }

    // ==============================
    // CHECK VERIFICATION STATUS
    // ==============================

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message:
          "This email address has already been verified.",
      });

      return;
    }

    // ==============================
    // GENERATE NEW OTP
    // ==============================

    const otp = generateOTP();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ==============================
    // REMOVE EXISTING OTP
    // ==============================

    await OTPModel.deleteMany({
      userId: user._id,
    });

    // ==============================
    // CREATE NEW OTP
    // ==============================

    await OTPModel.create({
      userId: user._id,
      otp,
      expiresAt,
    });

    // ==============================
    // SEND EMAIL
    // ==============================

    await sendEmail(
      user.email,
      "Your New UniPay Ghana Verification Code",
      ResendEmail(
        `${user.firstName} ${user.lastName}`,
        otp
      )
    );

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    res.status(200).json({
      success: true,

      message:
        "A new verification code has been sent to your email.",

      expiresIn: 600,
    });

  } catch (error) {

    console.error(
      "Resend OTP error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Unable to resend the verification code. Please try again.",
    });
  }
};

const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const {
      identifier,
      password,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!identifier || !password) {

      res.status(400).json({
        success: false,
        message:
          "Email or student ID and password are required.",
      });

      return;
    }

    const normalizedIdentifier =
      identifier.trim();

    let user;

    // ==============================
    // EMAIL LOGIN
    // ==============================

    if (
      validator.isEmail(
        normalizedIdentifier
      )
    ) {

      user =
        await User.findOne({
          email:
            normalizedIdentifier.toLowerCase(),
        }).select("+password");

    }

    // ==============================
    // STUDENT ID LOGIN
    // ==============================

    else {

      const student =
        await StudentProfile.findOne({
          studentId:
            normalizedIdentifier.toUpperCase(),
        });

      if (student) {

        user =
          await User.findById(
            student.user
          ).select("+password");

      }

    }

    // ==============================
    // USER NOT FOUND
    // ==============================

    if (!user) {

      res.status(401).json({
        success: false,
        message:
          "Invalid login credentials.",
      });

      return;
    }

    // ==============================
    // ACCOUNT STATUS
    // ==============================

    if (!user.isActive) {

      res.status(403).json({
        success: false,
        message:
          "This account has been deactivated. Please contact support.",
      });

      return;
    }

    // ==============================
    // EMAIL VERIFICATION
    // ==============================

    if (!user.emailVerified) {

      res.status(403).json({
        success: false,
        message:
          "Please verify your email address before logging in.",

        redirect: "/verify-otp",
      });

      return;
    }

    // ==============================
    // PASSWORD CHECK
    // ==============================

    if (!user.password) {

      res.status(400).json({
        success: false,
        message:
          "Password login is unavailable for this account.",
      });

      return;
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {

      res.status(401).json({
        success: false,
        message:
          "Invalid login credentials.",
      });

      return;
    }

    // ==============================
    // GENERATE TOKENS
    // ==============================

    const accessToken =
      createAccessToken(
        user._id.toString(),
        user.role
      );

    const refreshToken =
      createRefreshToken(
        user._id.toString()
      );

    // ==============================
    // SET COOKIES
    // ==============================

    setAppCookie(
      res,
      "usATK",
      accessToken,
      {
        path: "/",
        maxAge:
          15 * 60 * 1000,
      }
    );

    setAppCookie(
      res,
      "usRTK",
      refreshToken,
      {
        path: "/",
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );

    // ==============================
    // UPDATE LOGIN ACTIVITY
    // ==============================

    user.lastLogin =
      new Date();

    await user.save();

    // ==============================
    // RESPONSE
    // ==============================

    res.status(200).json({
      success: true,

      message:
        "Login successful.",

      user: {
        id: user._id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        fullName:
          `${user.firstName} ${user.lastName}`,

        email:
          user.email,

        role:
          user.role,
      },
    });

    // ==============================
    // BACKGROUND EMAIL
    // ==============================

    void sendEmail(
      user.email,
      "Welcome Back to UniPay Ghana",
      EmailWelcome(
        `${user.firstName} ${user.lastName}`
      )
    ).catch((error) => {
      console.error(
        "Login email error:",
        error
      );
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Something went wrong. Please try again later.",
    });
  }
};



const userProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });

      return;
    }

    const studentProfile =
      await StudentProfile.findOne({
        user: user._id,
      })
        .populate(
          "institution",
          "name shortName institutionCode"
        )
        .populate(
          "faculty",
          "name code"
        )
        .populate(
          "programme",
          "name code"
        );

    res.status(200).json({
      success: true,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },

      studentProfile,
    });

  } catch (error) {
    console.error(
      "User profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve user profile.",
    });
  }
};



const updateUserProfile = ()=>{
try {
  
} catch (error) {
  
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

const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.usRTK;

    // ==============================
    // CHECK REFRESH TOKEN
    // ==============================

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });

      return;
    }

    // ==============================
    // VERIFY REFRESH TOKEN
    // ==============================

    let decoded: { id: string };

    try {
      decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as { id: string };
    } catch (error) {
      res.clearCookie("usATK", {
        path: "/",
      });

      res.clearCookie("usRTK", {
        path: "/",
      });

      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });

      return;
    }

    // ==============================
    // FIND USER
    // ==============================

    const user = await User.findById(decoded.id);

    if (!user) {
      res.clearCookie("usATK", {
        path: "/",
      });

      res.clearCookie("usRTK", {
        path: "/",
      });

      res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });

      return;
    }

    // ==============================
    // CHECK ACCOUNT STATUS
    // ==============================

    if (!user.isActive) {
      res.clearCookie("usATK", {
        path: "/",
      });

      res.clearCookie("usRTK", {
        path: "/",
      });

      res.status(403).json({
        success: false,
        message:
          "This account has been deactivated. Please contact support.",
      });

      return;
    }

    // ==============================
    // CREATE NEW ACCESS TOKEN
    // ==============================

    const newAccessToken = createAccessToken(
      user._id.toString(),
      user.role
    );

    // ==============================
    // SET NEW ACCESS TOKEN
    // ==============================

    setAppCookie(
      res,
      "usATK",
      newAccessToken,
      {
        path: "/",
        maxAge: 15 * 60 * 1000,
      }
    );

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
    });

  } catch (error) {
    console.error(
      "Refresh token error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to refresh your session. Please try again.",
    });
  }
};


const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    // ==============================
    // CLEAR ACCESS TOKEN
    // ==============================

    res.clearCookie("usATK", {
      path: "/",
    });

    // ==============================
    // CLEAR REFRESH TOKEN
    // ==============================

    res.clearCookie("usRTK", {
      path: "/",
    });

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    res.status(200).json({
      success: true,
      message:
        "You have been logged out successfully.",
    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to log out at this time.",
    });
  }
};

const updatePaymentStatus = () =>{
  try {
    
  } catch (error) {
    
  }
};

const dashboardStats = () =>{
  
};

export { registerUser, verifyOTP, resendOTP, loginUser,  userProfile, updateUserProfile, googleAuthCallback, googleAuthFailure, refreshAccessToken, logoutUser, updatePaymentStatus, dashboardStats};