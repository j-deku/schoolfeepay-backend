import express, {Request, Response} from "express"
import studentRouter from "../routes/StudentRoute";
import AdminRouter from "../routes/AdminRoute";
//import paymentRouter from "../routes/PaymentRoute";
import PermissionRouter from "../routes/PermissionRoute";
import BotRouter from "../routes/BotRoute";

const apiRouter = express.Router();

apiRouter.use("/v1/auth", studentRouter);
apiRouter.use("/v1/auth", AdminRouter);
 
apiRouter.use("/student", studentRouter);
apiRouter.use("/admin", AdminRouter);


//apiRouter.use("/order", paymentRouter);
apiRouter.use("/permission", PermissionRouter);

apiRouter.use("/chat", BotRouter);


export default apiRouter;