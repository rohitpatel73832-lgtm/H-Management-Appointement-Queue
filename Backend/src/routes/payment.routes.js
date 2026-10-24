import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { createPaymentOrder, requestRefund, testPayment, verifyPayment } from "../controllers/payment.controller.js";



const paymentRouter = express.Router();
paymentRouter.get("/test", protect, authorize("patient"), testPayment);
paymentRouter.post("/create-order", protect, authorize("patient"), createPaymentOrder);
paymentRouter.post("/verify", protect, authorize("patient"), verifyPayment);
paymentRouter.post("/refund", protect, authorize("patient"), requestRefund);


export default paymentRouter;