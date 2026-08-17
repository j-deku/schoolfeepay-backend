import mongoose, {Schema, Document, Model} from "mongoose";

export interface IOTP extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const OTPModel: Model<IOTP> = 
mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema);

export default OTPModel;
