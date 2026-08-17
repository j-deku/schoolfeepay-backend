import userModel from '../models/UserModel'
import { Request,Response } from 'express';

//add items to use cart 
const addToCart = async(req:Request,res:Response): Promise<void> =>{
    try {
        let userData = await userModel.findById(req.body.userId);
        if(!userData){
            res.json({success:false,message:"User not found"});
            return;
        }
        let cartData = await userData.cartData;
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1;
        }else{
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added to Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

//remove items from user cart
const removeFromCart = async (req:Request,res:Response): Promise<void> =>{
    try {
        let userData = await userModel.findById(req.body.userId);
        if(!userData){
            res.json({success:false,message:"User not found"});
            return;
        }
        let cartData = await userData.cartData;
        if(cartData[req.body.itemId]>0){
            cartData[req.body.itemId]-= 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed from Cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

//fetch user cart data
const getCart = async (req:Request,res:Response): Promise<void> =>{
    try {
        let userData = await userModel.findById(req.body.userId);
        if(!userData){
            res.json({success:false,message:"User not found"});
            return;
        }
        let cartData = await userData.cartData;
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

export {addToCart,removeFromCart,getCart}