import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getDoctorQueue, updateQueueStatus } from "../controllers/queue.controller.js";



const queueRouter = express.Router();

queueRouter.get("/my",protect, authorize("doctor"), getDoctorQueue);
queueRouter.patch("/:queueId/status",protect, authorize("doctor"), updateQueueStatus)



export default queueRouter;