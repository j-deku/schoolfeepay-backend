import express from 'express'
import authMiddleware from '../middlewares/auth'
import { listPayment, placePayment, updateStatus, studentPayment, verifyPayment } from '../controllers/PaymentController'
import { dashboardStats } from '../controllers/UserController';

const paymentRouter  = express.Router();

paymentRouter.post("/place", authMiddleware,placePayment);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.post("/stats", dashboardStats);
paymentRouter.post("/studentPayments", authMiddleware, studentPayment);
paymentRouter.get("/list", listPayment);
paymentRouter.post("/status", updateStatus);
export default paymentRouter;