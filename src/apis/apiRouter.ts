import express, {Request, Response} from "express"
import studentRouter from "../routes/StudentRoute";
import AdminRouter from "../routes/AdminRoute";
//import paymentRouter from "../routes/PaymentRoute";
import PermissionRouter from "../routes/PermissionRoute";
import BotRouter from "../routes/BotRoute";
import institutionRouter from "../routes/InstitutionRoute";

const apiRouter = express.Router();

apiRouter.use("/v1", studentRouter);
apiRouter.use("/v1/admin", AdminRouter);

apiRouter.use("/v1/institutions", institutionRouter);
//apiRouter.use("/order", paymentRouter);
apiRouter.use("/permission", PermissionRouter);

apiRouter.use("/chat", BotRouter);


export default apiRouter;