import mongoose, { Schema, Types } from "mongoose";

export interface IAcademicYear extends Document {
  institution: Types.ObjectId;

  name: string;

  startDate: Date;
  endDate: Date;

  isCurrent: boolean;
  isActive: boolean;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isCurrent: {
      type: Boolean,
      default: false,
    },

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

academicYearSchema.index(
  { institution: 1, name: 1 },
  { unique: true }
);

export const AcademicYear = 
  mongoose.models.AcademicYear ||
  mongoose.model<IAcademicYear>("AcademicYear", academicYearSchema);