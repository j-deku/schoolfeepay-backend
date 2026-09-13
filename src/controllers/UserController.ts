import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoose from "mongoose";
import { Request, Response } from "express";

import OTPModel from "../models/OTPModel";
import ActivityLog from "../models/ActivityLog";
import { User } from "../models/UserModel";
import { StudentProfile } from "../models/StudentProfileModel";
import { Institution } from "../models/InstitutionModel";
import { Programme } from "../models/ProgrammeModel";
import { AcademicYear } from "../models/AcademicYearModel";

import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";
import { setAppCookie } from "../utils/CookieHelper";
import {
  EmailOTP,
  EmailWelcome,
  ResendEmail,
} from "../utils/EmailTemplates";

// ==============================
// TOKENS
// ==============================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not defined");

export const createAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "15m" });
};

export const createRefreshToken = (id: string) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

// ==============================
// REGISTER
// ==============================

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      studentId,
      institution,
      programme,
      level,
      academicYear,
      email,
      phone,
      password,
    } = req.body;

    // ==============================
    // VALIDATE REQUEST
    // ==============================

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !studentId ||
      !institution ||
      !programme ||
      !level ||
      !email ||
      !phone ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedStudentId = studentId.trim().toUpperCase();

    // ==============================
    // CHECK FOR EXISTING ACCOUNT
    // ==============================

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists."
            : "An account with this phone number already exists.",
      });
      return;
    }

    // ==============================
    // RESOLVE INSTITUTION
    // ==============================

    const institutionDoc = await Institution.findOne({
      institutionCode: institution.toUpperCase(),
      isActive: true,
    });

    if (!institutionDoc) {
      res.status(400).json({
        success: false,
        message: "Selected institution could not be found.",
      });
      return;
    }

    // ==============================
    // CHECK DUPLICATE STUDENT ID (SCOPED TO INSTITUTION)
    // ==============================

    const existingProfile = await StudentProfile.findOne({
      institution: institutionDoc._id,
      studentId: normalizedStudentId,
    });

    if (existingProfile) {
      res.status(409).json({
        success: false,
        message:
          "This student ID is already registered at this institution.",
      });
      return;
    }

    // ==============================
    // RESOLVE PROGRAMME
    // ==============================

    const programmeDoc = await Programme.findOne({
      institution: institutionDoc._id,
      name: programme,
      isActive: true,
    });

    if (!programmeDoc) {
      res.status(400).json({
        success: false,
        message: "Selected programme could not be found for this institution.",
      });
      return;
    }

    // ==============================
    // RESOLVE ACADEMIC YEAR 
    // ==============================

    const academicYearDoc = academicYear
      ? await AcademicYear.findOne({
          institution: institutionDoc._id,
          name: academicYear,
        })
      : null;

    // ==============================
    // CREATE ACCOUNT + PROFILE (TRANSACTION)
    // ==============================

session.startTransaction();

const hashedPassword = await bcrypt.hash(password, 10);

const [createdUser] = await User.create(
  [
    {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: "student",
    },
  ],
  { session }
);

if (!createdUser) {
  throw new Error("Failed to create user inside transaction");
}

await StudentProfile.create(
  [
    {
      user: createdUser._id,
      institution: institutionDoc._id,
      studentId: normalizedStudentId,
      dateOfBirth: new Date(dateOfBirth),
      faculty: programmeDoc.faculty,
      programme: programmeDoc._id,
      currentLevel: level,
      academicYear: academicYearDoc?._id,
    },
  ],
  { session }
);

await session.commitTransaction();

const otp = generateOTP();
const expiresAt = new Date(Date.now() + OTP_TTL_MS);


// ... OTP generation
await OTPModel.findOneAndUpdate(
  { userId: createdUser._id },
  { otp, expiresAt },
  { upsert: true, new: true }
);

void sendEmail(
  createdUser.email,
  "Verify Your UniPay Ghana Account",
  EmailOTP(`${createdUser.firstName} ${createdUser.lastName}`, otp)
).catch((error) => {
  console.error("Registration email error:", error);
});

void ActivityLog.create({
  userId: createdUser._id,
  activity: "Account registered",
}).catch(() => {});

res.status(201).json({
  success: true,
  message: "Account created. Please verify your email with the code we sent you.",
  userId: createdUser._id,
  expiresIn: OTP_TTL_MS / 1000,
});

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create your account. Please try again.",
    });
  } finally {
    session.endSession();
  }
};

// ==============================
// VERIFY OTP
// ==============================

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      res.status(400).json({
        success: false,
        message: "User ID and verification code are required.",
      });
      return;
    }

    const otpRecord = await OTPModel.findOne({ userId });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTPModel.deleteOne({ _id: otpRecord._id });

      res.status(400).json({
        success: false,
        message:
          "This verification code has expired. Please request a new one.",
      });
      return;
    }

    if (otpRecord.otp !== otp) {
      res.status(400).json({
        success: false,
        message: "Incorrect verification code.",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    await OTPModel.deleteOne({ _id: otpRecord._id });

    const accessToken = createAccessToken(user._id.toString(), user.role);
    const refreshToken = createRefreshToken(user._id.toString());

    setAppCookie(res, "usATK", accessToken, {
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    setAppCookie(res, "usRTK", refreshToken, {
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    void ActivityLog.create({
      userId: user._id,
      activity: "Email verified",
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Your account has been verified successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

    void sendEmail(
      user.email,
      "Welcome to UniPay Ghana",
      EmailWelcome(`${user.firstName} ${user.lastName}`)
    ).catch((error) => {
      console.error("Welcome email error:", error);
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify your account. Please try again.",
    });
  }
};

// ==============================
// RESEND OTP
// ==============================

const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: "This email address has already been verified.",
      });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await OTPModel.findOneAndUpdate(
      { userId: user._id },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendEmail(
      user.email,
      "Your New UniPay Ghana Verification Code",
      ResendEmail(`${user.firstName} ${user.lastName}`, otp)
    );

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
      expiresIn: OTP_TTL_MS / 1000,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to resend the verification code. Please try again.",
    });
  }
};

// ==============================
// LOGIN
// ==============================

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "Email or student ID and password are required.",
      });
      return;
    }

    const normalizedIdentifier = identifier.trim();

    let user;

    // ==============================
    // EMAIL LOGIN
    // ==============================

    if (validator.isEmail(normalizedIdentifier)) {
      user = await User.findOne({
        email: normalizedIdentifier.toLowerCase(),
      }).select("+password");
    }

    // ==============================
    // STUDENT ID LOGIN
    // ==============================

    else {
      const student = await StudentProfile.findOne({
        studentId: normalizedIdentifier.toUpperCase(),
      });

      if (student) {
        user = await User.findById(student.user).select("+password");
      }
    }

    // ==============================
    // USER NOT FOUND
    // ==============================

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid login credentials.",
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
        message: "Please verify your email address before logging in.",
        redirect: "/verify-otp",
        userId: user._id,
      });
      return;
    }

    // ==============================
    // PASSWORD CHECK
    // ==============================

    if (!user.password) {
      res.status(400).json({
        success: false,
        message: "Password login is unavailable for this account.",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid login credentials.",
      });
      return;
    }

    // ==============================
    // GENERATE TOKENS
    // ==============================

    const accessToken = createAccessToken(user._id.toString(), user.role);
    const refreshToken = createRefreshToken(user._id.toString());

    // ==============================
    // SET COOKIES
    // ==============================

    setAppCookie(res, "usATK", accessToken, {
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    setAppCookie(res, "usRTK", refreshToken, {
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    // ==============================
    // UPDATE LOGIN ACTIVITY
    // ==============================

    user.lastLogin = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    void ActivityLog.create({
      userId: user._id,
      activity: "User logged in",
    }).catch(() => {});

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ==============================
// USER PROFILE
// ==============================

const userProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const user = await User.findById(req.user).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const studentProfile = await StudentProfile.findOne({
      user: user._id,
    })
      .populate("institution", "name shortName institutionCode")
      .populate("faculty", "name code")
      .populate("programme", "name code")
      .populate("academicYear", "name");

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
    console.error("User profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile.",
    });
  }
};

// ==============================
// UPDATE USER PROFILE
// ==============================

const updateUserProfile = async (
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

    const { firstName, lastName, phone } = req.body;

    const updates: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
    }> = {};

    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (phone) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No changes were provided.",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(req.user, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update your profile. Please try again.",
    });
  }
};

// ==============================
// REFRESH ACCESS TOKEN
// ==============================

const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.usRTK;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    let decoded: { id: string };

    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        id: string;
      };
    } catch (error) {
      res.clearCookie("usATK", { path: "/" });
      res.clearCookie("usRTK", { path: "/" });

      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.clearCookie("usATK", { path: "/" });
      res.clearCookie("usRTK", { path: "/" });

      res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
      return;
    }

    if (!user.isActive) {
      res.clearCookie("usATK", { path: "/" });
      res.clearCookie("usRTK", { path: "/" });

      res.status(403).json({
        success: false,
        message:
          "This account has been deactivated. Please contact support.",
      });
      return;
    }

    const newAccessToken = createAccessToken(
      user._id.toString(),
      user.role
    );

    setAppCookie(res, "usATK", newAccessToken, {
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to refresh your session. Please try again.",
    });
  }
};

// ==============================
// LOGOUT
// ==============================

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("usATK", { path: "/" });
    res.clearCookie("usRTK", { path: "/" });

    res.status(200).json({
      success: true,
      message: "You have been logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log out at this time.",
    });
  }
};

// ==============================
// TODO — NOT YET IMPLEMENTED
// ==============================
// These depend on decisions I don't have yet:
//   updatePaymentStatus: needs your payment gateway (Paystack / Flutterwave / etc.)
//     and whether it's called from a webhook handler or directly.
//   dashboardStats: needs to know exactly which numbers the dashboard should show
//     (outstanding balance, upcoming due dates, payment history count, etc.)
// Tell me which gateway and what the dashboard should surface, and I'll fill these in properly.

const updatePaymentStatus = (_req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: "Not implemented yet.",
  });
};

const dashboardStats = (_req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: "Not implemented yet.",
  });
};

export {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  userProfile,
  updateUserProfile,
  refreshAccessToken,
  logoutUser,
  updatePaymentStatus,
  dashboardStats,
};