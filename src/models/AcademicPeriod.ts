import mongoose, { Schema, Types } from "mongoose";

export interface IAcademicPeriod extends Document {
  institution: Types.ObjectId;

  academicYear: Types.ObjectId;

  name: string;

  startDate: Date;
  endDate: Date;

  isActive: boolean;
}

const academicPeriodSchema = new Schema<IAcademicPeriod>(
  {
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

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: Date,

    endDate: Date,

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

export const AcademicPeriod = 
  mongoose.models.AcademicPeriod ||
  mongoose.model<IAcademicPeriod>("AcademicPeriod", academicPeriodSchema);