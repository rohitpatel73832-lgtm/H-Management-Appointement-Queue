import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { createPreConsultationSummary } from "../controllers/ai.controller.js";




const aiRouter = express.Router();
aiRouter.post("/pre-consultation-summary", protect, authorize("patient"), createPreConsultationSummary);




export default aiRouter;