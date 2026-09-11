import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  shortName: string;
  institutionCode: string;

  email?: string;
  phone?: string;

  address?: string;
  website?: string;

  logo?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
    },

    institutionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    email: String,

    phone: String,

    address: String,

    website: String,

    logo: String,

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

institutionSchema.index({ institutionCode: 1 });

export const Institution: Model<IInstitution> =
  mongoose.models.Institution ||
  mongoose.model<IInstitution>("Institution", institutionSchema);