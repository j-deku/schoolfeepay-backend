import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IFaculty extends Document {
  institution: Types.ObjectId;

  name: string;
  code: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
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

facultySchema.index(
  { institution: 1, code: 1 },
  { unique: true }
);

export const Faculty =
  mongoose.models.Faculty ||
  mongoose.model<IFaculty>("Faculty", facultySchema);