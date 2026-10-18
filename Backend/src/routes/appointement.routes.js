import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { completeAppointment, createAppointment, getDoctorAppointments, getMyAppointments } from "../controllers/appointement.controller.js";




const appointmentRouter = express.Router();
appointmentRouter.post("/",protect, authorize("patient"), createAppointment);

// Patient: get their own appointments
appointmentRouter.get("/my",protect ,authorize("patient") ,getMyAppointments)

// Doctor: get appointments assigned to their doctor profile
appointmentRouter.get("/doctor", protect, authorize("doctor"),getDoctorAppointments )

appointmentRouter.patch("/:appointementId/complete", protect, authorize("doctor"), completeAppointment)



export default appointmentRouter;