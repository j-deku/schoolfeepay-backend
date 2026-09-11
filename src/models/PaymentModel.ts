import mongoose, { Schema, Types } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "cancelled"
  | "refunded"
  | "reversed";

export type PaymentMethod =
  | "mobile_money"
  | "card"
  | "bank_transfer"
  | "bank_deposit";

export interface IPayment extends Document {
  student: Types.ObjectId;

  feeAccount: Types.ObjectId;

  institution: Types.ObjectId;

  amount: number;
  currency: string;

  paymentMethod: PaymentMethod;

  gateway: string;

  transactionReference: string;
  gatewayTransactionId?: string;

  status: PaymentStatus;

  initiatedAt: Date;
  completedAt?: Date;

  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },

    feeAccount: {
      type: Schema.Types.ObjectId,
      ref: "StudentFeeAccount",
      required: true,
      index: true,
    },

    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      default: "GHS",
    },

    paymentMethod: {
      type: String,
      enum: [
        "mobile_money",
        "card",
        "bank_transfer",
        "bank_deposit",
      ],
      required: true,
    },

    gateway: {
      type: String,
      required: true,
    },

    transactionReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    gatewayTransactionId: {
      type: String,
      sparse: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "successful",
        "failed",
        "cancelled",
        "refunded",
        "reversed",
      ],
      default: "pending",
    },

    initiatedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({
  student: 1,
  createdAt: -1,
});

paymentSchema.index({
  feeAccount: 1,
  status: 1,
});


export const Payment = 
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", paymentSchema);