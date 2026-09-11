import mongoose, { Schema, Types } from "mongoose";

export type NotificationType =
  | "payment_success"
  | "payment_failed"
  | "payment_reminder"
  | "payment_overdue"
  | "risk_alert"
  | "system";

export interface INotification extends Document {
  user: Types.ObjectId;

  type: NotificationType;

  title: string;
  message: string;

  read: boolean;

  relatedPayment?: Types.ObjectId;

  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "payment_success",
        "payment_failed",
        "payment_reminder",
        "payment_overdue",
        "risk_alert",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    relatedPayment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({
  user: 1,
  read: 1,
  createdAt: -1,
});


export const Notification = 
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);