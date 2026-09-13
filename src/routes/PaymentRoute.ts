/*
import express from 'express'
import { listPayment, placePayment, updateStatus, studentPayment, verifyPayment } from '../controllers/PaymentController'
import { dashboardStats } from '../controllers/UserController';
import { protect } from '../middlewares/auth';

const paymentRouter  = express.Router();

paymentRouter.post("/place", protect,placePayment);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.post("/stats", dashboardStats);
paymentRouter.post("/studentPayments", protect, studentPayment);
paymentRouter.get("/list", listPayment);
paymentRouter.post("/status", updateStatus);
export default paymentRouter;
*/