import mongoose, { Schema, Types } from "mongoose";

export interface INotificationLog extends Document {
  notification: Types.ObjectId;

  channel: "in_app" | "email" | "sms";

  status: "pending" | "sent" | "failed";

  sentAt?: Date;

  failureReason?: string;
}

const notificationLogSchema =
  new Schema<INotificationLog>(
    {
      notification: {
        type: Schema.Types.ObjectId,
        ref: "Notification",
        required: true,
      },

      channel: {
        type: String,
        enum: ["in_app", "email", "sms"],
        required: true,
      },

      status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
      },

      sentAt: Date,

      failureReason: String,
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );


  export const NotificationLog = 
    mongoose.models.NotificationLog ||
    mongoose.model<INotificationLog>("NotificationLog", notificationLogSchema);