import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDesign extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity?: number; 
}

const designSchema = new Schema<IDesign>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, default: 0 },
});

const Design: Model<IDesign> =
  mongoose.models.design || mongoose.model<IDesign>("design", designSchema);

export default Design;
