import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { createAvailability, deleteAvailability, getMyAvailability, updateAvailability } from "../controllers/availability.controller.js";




const availabilityRouter = express.Router();


availabilityRouter.post("/", protect, authorize("doctor"), createAvailability);
availabilityRouter.get("/", protect, authorize("doctor"), getMyAvailability);
availabilityRouter.patch("/:availabilityId", protect, authorize("doctor"), updateAvailability);
availabilityRouter.delete("/:availabilityId", protect, authorize("doctor"), deleteAvailability);



export default availabilityRouter;