// models/Permission.js
import mongoose, {Schema, Document, Model} from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description: string;
}

const permissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
  description: { type: String },
});

const Permission: Model<IPermission> =
mongoose.models.Permission || mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;