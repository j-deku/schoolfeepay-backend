import mongoose, { Schema, Types } from "mongoose";

export type InstallmentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overdue";

export interface IPaymentInstallment extends Document {
  paymentPlan: Types.ObjectId;

  installmentNumber: number;

  amount: number;

  amountPaid: number;

  dueDate: Date;

  status: InstallmentStatus;
}

const paymentInstallmentSchema =
  new Schema<IPaymentInstallment>(
    {
      paymentPlan: {
        type: Schema.Types.ObjectId,
        ref: "PaymentPlan",
        required: true,
      },

      installmentNumber: {
        type: Number,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      amountPaid: {
        type: Number,
        default: 0,
      },

      dueDate: {
        type: Date,
        required: true,
      },

      status: {
        type: String,
        enum: ["pending", "partial", "paid", "overdue"],
        default: "pending",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

paymentInstallmentSchema.index(
  {
    paymentPlan: 1,
    installmentNumber: 1,
  },
  {
    unique: true,
  }
);



export const PaymentInstallment = 
  mongoose.models.PaymentInstallment ||
  mongoose.model<IPaymentInstallment>("PaymentInstallment", paymentInstallmentSchema);