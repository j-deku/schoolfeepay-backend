import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "student" | "staff" | "admin" | "super_admin";

export interface IUser extends Document {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  password?: string;

  role: UserRole;

  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;

  lastLogin?: Date;
  lastLoginIp?: string;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
<<<<<<< HEAD
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "staff", "admin", "super_admin"],
      default: "student",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,

    lastLoginIp: String,
=======
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    studentId: { type: Number, required: true, unique: true},
    institution: { type: String, enum:["gctu", "upsa", "knust", "winneba", "Legon"], default:"gctu" },
    role: { type: String, enum:["admin", "user"], default: "user" },
    password: { type: String },
    cartData: { type: Object},
    avatar: { type: String },
    courseData: { type: Object, default: {} },
 //   googleId: { type: String, unique: true, sparse: true, },
    verified: { type: Boolean, default: false },
    message: {type: String}
>>>>>>> ddae35fb587e88ff57a29a4d574dee84bccd7229
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);