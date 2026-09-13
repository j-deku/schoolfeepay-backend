import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProgramme extends Document {
  institution: Types.ObjectId;
  faculty?: Types.ObjectId;

  name: string;
  code: string;

  duration?: number;

  isActive: boolean;
}

const programmeSchema = new Schema<IProgramme>(
  {
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
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
    },

    duration: Number,

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

programmeSchema.index(
  { institution: 1, code: 1 },
  { unique: true }
);


export const Programme: Model<IProgramme> =
  (mongoose.models.Programme as Model<IProgramme>) ||
  mongoose.model<IProgramme>("Programme", programmeSchema);