import orderModel, { IOrderItem } from "../models/OrderModel";
import userModel from '../models/UserModel';
import Paystack from 'paystack';
import {Request,Response} from 'express';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY as string);

interface PlaceOrderBody {
  userId: string;
  items: IOrderItem[];
  amount: number;
  address: Record<string, any>;
  email: string;
}
//placing user order for frontend
const placePayment = async (
  req: Request<{}, {}, PlaceOrderBody>,
  res: Response): Promise<void> => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  
    if (!req.body.userId || !req.body.items || !req.body.amount || !req.body.address) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }
  
    try {
      const newOrder = new orderModel({
        userId: req.body.userId,
        items: req.body.items,
        amount: req.body.amount,
        address: req.body.address,
        email: req.body.email,
      });
      await newOrder.save();
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
  
      const line_items = req.body.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      }));
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery charges",
          },
          unit_amount: 2 * 100,
        },
        quantity: 1,
      });
  
      const paymentData = {
        line_items: line_items,
        email:req.body.email,
        mode: "payment",
        amount:req.body.amount * 100,
        callback_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      }

      const response = await paystack.transaction.initialize(paymentData as any);
      if(response.status){
        res.json({ success: true,authorization_url:response.data.authorization_url });
      }else{
        res.status(500).json({success:false,message:"Error initializing payment"});
      }
    } catch (error) {
      if(error instanceof Error){
      console.error("Paystack initializing creation error:", error);
      res.status(500).json({ success: false, message: "Error creating Paystack transaction", error: error.message });
      }
    }
  };
  
const verifyPayment = async(req:Request,res:Response)=>{
    const {orderId,success} = req.body;
    try {
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Payment successful"});
        }else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Payment failed"});
        }
    } catch (error) {                             
        console.log(error);
        res.json({success:false,message:"Error verifying payment"});
    }
} 

//user orders for frontend
const studentPayment = async(req:Request,res:Response) =>{
try {
    const orders = await orderModel.find({userId:req.body.userId});
    res.json({success:true,data:orders})
} catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"});
}
}

//Listing orders for admin panel
const listPayment = async(req:Request,res:Response) =>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

//api for updating order status
const updateStatus = async (req:Request,res:Response) =>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

export {placePayment,verifyPayment,studentPayment,listPayment,updateStatus}
