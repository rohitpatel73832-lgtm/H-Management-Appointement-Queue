import express from "express";
import { getAllDoctors, getAllUsers, updateDoctorApproval, updateDoctorStatus } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { cancelAppointmentByAdmin, getAllAppointments, getPlatformStats } from "../controllers/adminAppointement.controller.js";





const adminRouter = express.Router();

adminRouter.get("/users", protect, authorize("admin"), getAllUsers);
adminRouter.get("/doctors", protect, authorize("admin"), getAllDoctors);
adminRouter.patch("/doctors/:id/status", protect, authorize("admin"), updateDoctorStatus);

// Approve or reject doctor registration
adminRouter.patch("/doctors/:id/approval", protect, authorize("admin"), updateDoctorApproval)


adminRouter.get("/appointements", protect, authorize("admin"), getAllAppointments);
adminRouter.patch("/appointements/:id/cancel", protect, authorize("admin"), cancelAppointmentByAdmin);
adminRouter.get("/stats", protect, authorize("admin"), getPlatformStats);



export default adminRouter;