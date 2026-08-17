// models/ActivityLog.js
import mongoose, {Schema, Document, Model} from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  activity: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  activity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ActivityLog: Model<IActivityLog> = 
mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;