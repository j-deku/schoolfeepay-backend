import express, {Request, Response} from "express"
import StudentRouter from "../routes/StudentRoute";
import AdminRouter from "../routes/AdminRoute";
import cartRouter from "../routes/CartRoute";
import paymentRouter from "../routes/PaymentRoute";
import PermissionRouter from "../routes/PermissionRoute";
import BotRouter from "../routes/BotRoute";

const apiRouter = express.Router();
 
apiRouter.use("/student", StudentRouter);
apiRouter.use("/admin", AdminRouter);


apiRouter.use("/cart", cartRouter);
apiRouter.use("/order", paymentRouter);
apiRouter.use("/permission", PermissionRouter);

apiRouter.use("/chat", BotRouter);


export default apiRouter;