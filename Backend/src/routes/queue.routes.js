import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getDoctorQueue, getMyWaitingTime, updateQueueStatus } from "../controllers/queue.controller.js";



const queueRouter = express.Router();

queueRouter.get("/my",protect, authorize("doctor"), getDoctorQueue);
queueRouter.patch("/:queueId/status",protect, authorize("doctor"), updateQueueStatus)
queueRouter.get("/my-wait-time", protect, authorize("patient"), getMyWaitingTime);


export default queueRouter;