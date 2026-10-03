import express from "express";
import { createDoctorProfile } from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";




const doctorRouter = express.Router();

doctorRouter.post("/profile",protect,authorize("doctor"),createDoctorProfile);
    



export default doctorRouter
    
    
    

