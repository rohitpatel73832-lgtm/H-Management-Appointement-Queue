import express from "express";
import { getAllDoctors, getAllUsers, updateDoctorStatus } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";





const adminRouter = express.Router();

adminRouter.get("/users", protect, authorize("admin"), getAllUsers);
adminRouter.get("/doctors", protect, authorize("admin"), getAllDoctors);
adminRouter.patch("/doctors/:id/status", protect, authorize("admin"), updateDoctorStatus);



export default adminRouter;