import mongoose, { Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  user?: Types.ObjectId;

  action: string;

  entityType: string;

  entityId?: Types.ObjectId;

  description?: string;

  ipAddress?: string;

  metadata?: Record<string, unknown>;

  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
    },

    description: String,

    ipAddress: String,

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

auditLogSchema.index({
  entityType: 1,
  entityId: 1,
});

auditLogSchema.index({
  createdAt: -1,
});



  export const AuditLog = 
    mongoose.models.AuditLog ||
    mongoose.model<IAuditLog>("AuditLog", auditLogSchema);