import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  studentId: number;
  institution: string;
  role: string;
  password?: string;
  avatar?: string;
  cartData: Record<string, any>;
  courseData: Record<string, any>;
  //  googleId?: string;
  verified: boolean;
  message: string;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    studentId: { type: Number, required: true, unique: true},
    institution: { type: String, enum:["gctu", "upsa", "knust", "winneba"], default:"gctu" },
    role: { type: String, enum:["admin", "user"], default: "user" },
    password: { type: String },
    cartData: { type: Object},
    avatar: { type: String },
    courseData: { type: Object, default: {} },
 //   googleId: { type: String, unique: true, sparse: true, },
    verified: { type: Boolean, default: false },
    message: {type: String}
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
