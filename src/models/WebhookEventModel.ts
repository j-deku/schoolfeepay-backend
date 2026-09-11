import mongoose, { Schema } from "mongoose";

export interface IWebhookEvent extends Document {
  provider: string;

  eventId: string;

  eventType: string;

  processed: boolean;

  processedAt?: Date;

  payload: Record<string, unknown>;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: {
      type: String,
      required: true,
    },

    eventId: {
      type: String,
      required: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    processed: {
      type: Boolean,
      default: false,
    },

    processedAt: Date,

    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

webhookEventSchema.index(
  {
    provider: 1,
    eventId: 1,
  },
  {
    unique: true,
  }
);


  export const WebhookEvent = 
    mongoose.models.WebhookEvent ||
    mongoose.model<IWebhookEvent>("WebhookEvent", webhookEventSchema);