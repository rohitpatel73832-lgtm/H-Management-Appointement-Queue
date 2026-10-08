import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { testPayment } from "../controllers/payment.controller.js";



const paymentRouter = express.Router();
paymentRouter.get("/test", protect, authorize("patient"), testPayment);




export default paymentRouter;