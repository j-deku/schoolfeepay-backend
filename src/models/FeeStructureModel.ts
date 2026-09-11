import mongoose, { Schema, Types } from "mongoose";

export interface IFeeItem {
  name: string;
  amount: number;
  required: boolean;
}

export interface IFeeStructure extends Document {
  institution: Types.ObjectId;

  programme?: Types.ObjectId;
  faculty?: Types.ObjectId;

  level?: string;

  academicYear: Types.ObjectId;
  academicPeriod?: Types.ObjectId;

  currency: string;

  items: IFeeItem[];

  totalAmount: number;

  dueDate?: Date;

  isActive: boolean;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
    },

    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
    },

    level: String,

    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    academicPeriod: {
      type: Schema.Types.ObjectId,
      ref: "AcademicPeriod",
    },

    currency: {
      type: String,
      default: "GHS",
    },

    items: [
      {
        name: {
          type: String,
          required: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },

        required: {
          type: Boolean,
          default: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export const FeeStructure = 
  mongoose.models.FeeStructure ||
  mongoose.model<IFeeStructure>("FeeStructure", feeStructureSchema);