import express from 'express'
import {addToCart,removeFromCart,getCart} from '../controllers/CartControllers'
import authMiddleware from '../middlewares/auth';

const cartRouter = express.Router();

cartRouter.post("/add",authMiddleware,addToCart)
cartRouter.post("/remove",authMiddleware,removeFromCart)
cartRouter.post("/get",authMiddleware,getCart)
    

export default cartRouter;