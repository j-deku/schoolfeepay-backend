import mongoose, { Schema, Types } from "mongoose";

export type RiskLevel = "low" | "medium" | "high";

export interface IPaymentRisk extends Document {
  student: Types.ObjectId;

  feeAccount: Types.ObjectId;

  riskLevel: RiskLevel;

  riskScore: number;

  factors: string[];

  lastCalculatedAt: Date;
}

const paymentRiskSchema = new Schema<IPaymentRisk>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    feeAccount: {
      type: Schema.Types.ObjectId,
      ref: "StudentFeeAccount",
      required: true,
      unique: true,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    factors: [
      {
        type: String,
      },
    ],

    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export const PaymentRisk = 
  mongoose.models.PaymentRisk ||
  mongoose.model<IPaymentRisk>("PaymentRisk", paymentRiskSchema);