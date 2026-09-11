import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose";

export interface IOTP extends Document {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  otp: string;

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One active OTP per user
otpSchema.index(
  { userId: 1 },
  { unique: true }
);

// Automatically remove expired OTPs
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OTP: Model<IOTP> =
  mongoose.models.OTP ||
  mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;