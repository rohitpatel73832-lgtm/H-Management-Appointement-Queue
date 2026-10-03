import express from "express";
import { createDoctorProfile, getAllDoctors, getDoctorById } from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";




const doctorRouter = express.Router();

doctorRouter.post("/profile",protect,authorize("doctor"),createDoctorProfile);
doctorRouter.get("/",protect,authorize("patient"),getAllDoctors);
doctorRouter.get("/:doctorId",protect,authorize("patient"),getDoctorById);



export default doctorRouter
    
    
    

