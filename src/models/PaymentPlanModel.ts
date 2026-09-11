import mongoose, { Schema, Types } from "mongoose";

export type PaymentPlanType =
  | "full"
  | "installment"
  | "custom";

export interface IPaymentPlan extends Document {
  feeAccount: Types.ObjectId;

  type: PaymentPlanType;

  totalAmount: number;

  status: "active" | "completed" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const paymentPlanSchema = new Schema<IPaymentPlan>(
  {
    feeAccount: {
      type: Schema.Types.ObjectId,
      ref: "StudentFeeAccount",
      required: true,
    },

    type: {
      type: String,
      enum: ["full", "installment", "custom"],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export const PaymentPlan = 
  mongoose.models.PaymentPlan ||
  mongoose.model<IPaymentPlan>("PaymentPlan", paymentPlanSchema);