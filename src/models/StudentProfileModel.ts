import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type StudentStatus =
  | "active"
  | "graduated"
  | "deferred"
  | "suspended"
  | "withdrawn";

export interface IStudentProfile extends Document {
  user: Types.ObjectId;

  institution: Types.ObjectId;

  dateOfBirth: Date;

  studentId: string;

  faculty?: Types.ObjectId;
  programme?: Types.ObjectId;

  currentLevel?: string;
  academicYear?: Types.ObjectId;

  status: StudentStatus;

  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
    },

    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
    },

    currentLevel: {
      type: String,
      trim: true,
    },

    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
    },

    status: {
      type: String,
      enum: ["active", "graduated", "deferred", "suspended", "withdrawn"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

studentProfileSchema.index({ institution: 1, studentId: 1 }, { unique: true });

export const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", studentProfileSchema);