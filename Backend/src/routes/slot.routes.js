import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getDoctorSlots } from "../controllers/slot.controller.js";




const slotRouter = express.Router();

slotRouter.get("/",protect,authorize("patient"),getDoctorSlots)

export default slotRouter;