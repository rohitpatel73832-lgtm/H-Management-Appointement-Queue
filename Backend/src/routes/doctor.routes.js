import express from "express";
import { createDoctorProfile, getAllDoctors, getDoctorById, getMyDoctorProfile, updateDoctorProfile } from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";




const doctorRouter = express.Router();

doctorRouter.post("/profile",protect,authorize("doctor"),createDoctorProfile);

// Get the logged-in doctor's own profile
doctorRouter.get("/profile",protect,authorize("doctor"),getMyDoctorProfile);
doctorRouter.patch("/profile",protect,authorize("doctor"),updateDoctorProfile);

doctorRouter.get("/",protect,authorize("patient"),getAllDoctors);
doctorRouter.get("/:doctorId",protect,authorize("patient"),getDoctorById);



export default doctorRouter
    
    
    

