import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type FeeAccountStatus =
  | "unpaid"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

export interface IStudentFeeAccount extends Document {
  student: Types.ObjectId;

  institution: Types.ObjectId;

  academicYear: Types.ObjectId;
  academicPeriod?: Types.ObjectId;

  feeStructure: Types.ObjectId;

  totalAmount: number;

  amountPaid: number;
  outstandingBalance: number;

  status: FeeAccountStatus;

  dueDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const studentFeeAccountSchema = new Schema<IStudentFeeAccount>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },

    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    academicPeriod: {
      type: Schema.Types.ObjectId,
      ref: "AcademicPeriod",
    },

    feeStructure: {
      type: Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    outstandingBalance: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "overdue", "cancelled"],
      default: "unpaid",
    },

    dueDate: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const StudentFeeAccount: Model<IStudentFeeAccount> =
  mongoose.models.StudentFeeAccount ||
  mongoose.model<IStudentFeeAccount>("StudentFeeAccount", studentFeeAccountSchema);