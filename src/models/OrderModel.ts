import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId; 
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  amount: number;
  address: Record<string, any>;
  status: string;
  date: Date;
  payment: boolean;
  email: string;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  items: {
    type: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "design", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    required: true,
  },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Design Processing..." },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  email: { type: String, required: true },
});

const Order: Model<IOrder> =
  mongoose.models.order || mongoose.model<IOrder>("order", orderSchema);

export default Order;