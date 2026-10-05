import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { createAppointment, getMyAppointments } from "../controllers/appointement.controller.js";




const appointmentRouter = express.Router();
appointmentRouter.post("/",protect, authorize("patient"), createAppointment);

//get my appointements
appointmentRouter.get("/my",protect ,authorize("patient") ,getMyAppointments)


export default appointmentRouter;